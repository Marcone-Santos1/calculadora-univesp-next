import { PrismaClient as ClientPG } from './generated/client-pg/index.js';
import { PrismaClient as ClientMySQL } from './generated/client-mysql/index.js';

// Configuração
const BATCH_SIZE = 1000; // Quantos registros processar por vez

const pg = new ClientPG();
const mysql = new ClientMySQL();

async function migrateModel(modelName: string, pgDelegate: any, mysqlDelegate: any) {
  console.log(`\n🔄 Iniciando migração de: ${modelName}`);

  const total = await pgDelegate.count();
  console.log(`📊 Total de registros encontrados: ${total}`);

  if (total === 0) {
    console.log(`✅ ${modelName} está vazio. Pulando.`);
    return;
  }

  let processed = 0;

  while (processed < total) {
    // 1. Buscar dados do Postgres em lotes
    const batch = await pgDelegate.findMany({
      take: BATCH_SIZE,
      skip: processed,
    });

    // 2. Inserir no MySQL
    // createMany é muito mais rápido que create um por um
    await mysqlDelegate.createMany({
      data: batch,
      skipDuplicates: true, // Evita crash se rodar o script duas vezes
    });

    processed += batch.length;
    console.log(`   ↳ Migrados ${processed}/${total} registros...`);
  }

  console.log(`✅ ${modelName} concluído com sucesso!`);
}

async function main() {
  console.log('🚀 INICIANDO MIGRAÇÃO COMPLETA (PG -> MySQL)...\n');

  // 1. Desativar verificações de Chave Estrangeira no MySQL
  // Isso permite inserir dados fora de ordem e resolve dependências circulares
  await mysql.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=0;');
  console.log('🔓 Verificações de Foreign Key DESATIVADAS temporariamente.');

  try {
    // --- ORDEM DE MIGRAÇÃO ---
    // (A ordem não é estritamente necessária com FK checks desligados,
    // mas ajuda a manter a lógica visual)

    // 1. Usuários e Auth
    await migrateModel('User', pg.user, mysql.user);
    await migrateModel('Account', pg.account, mysql.account);
    await migrateModel('Session', pg.session, mysql.session);
    await migrateModel('VerificationToken', pg.verificationToken, mysql.verificationToken);

    // 2. Perfis e Configs
    await migrateModel('AdvertiserProfile', pg.advertiserProfile, mysql.advertiserProfile);
    await migrateModel('AacReportConfig', pg.aacReportConfig, mysql.aacReportConfig);

    // 3. Conteúdo Principal
    await migrateModel('Subject', pg.subject, mysql.subject);
    await migrateModel('BlogPost', pg.blogPost, mysql.blogPost);
    await migrateModel('Question', pg.question, mysql.question);
    await migrateModel('Alternative', pg.alternative, mysql.alternative);

    // 4. Interações e Gamification
    await migrateModel('Comment', pg.comment, mysql.comment);
    await migrateModel('Vote', pg.vote, mysql.vote);
    await migrateModel('CommentVote', pg.commentVote, mysql.commentVote);
    await migrateModel('ReputationLog', pg.reputationLog, mysql.reputationLog);
    await migrateModel('Notification', pg.notification, mysql.notification);
    await migrateModel('UserAchievement', pg.userAchievement, mysql.userAchievement);
    await migrateModel('ScrapeHistory', pg.scrapeHistory, mysql.scrapeHistory);
    await migrateModel('Feedback', pg.feedback, mysql.feedback);
    await migrateModel('Report', pg.report, mysql.report);

    // 5. AAC
    await migrateModel('AacActivity', pg.aacActivity, mysql.aacActivity);

    // 6. Simulados (Mock Exams)
    await migrateModel('MockExam', pg.mockExam, mysql.mockExam);
    await migrateModel('MockExamQuestion', pg.mockExamQuestion, mysql.mockExamQuestion);

    // 7. Sistema de Ads (Campanhas e Logs)
    await migrateModel('AdCampaign', pg.adCampaign, mysql.adCampaign);
    await migrateModel('AdCreative', pg.adCreative, mysql.adCreative);
    await migrateModel('AdTransaction', pg.adTransaction, mysql.adTransaction);
    await migrateModel('AdDailyMetrics', pg.adDailyMetrics, mysql.adDailyMetrics);
    await migrateModel('AdCreativeDailyMetrics', pg.adCreativeDailyMetrics, mysql.adCreativeDailyMetrics);

    // Logs costumam ser as tabelas maiores, deixamos por último
    await migrateModel('AdEventLog', pg.adEventLog, mysql.adEventLog);

  } catch (error) {
    console.error('❌ ERRO CRÍTICO DURANTE A MIGRAÇÃO:', error);
  } finally {
    // Reativar FK Checks independente de erro ou sucesso
    await mysql.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=1;');
    console.log('\n🔒 Verificações de Foreign Key REATIVADAS.');

    await pg.$disconnect();
    await mysql.$disconnect();
    console.log('\n🏁 Processo finalizado.');
  }
}

main();