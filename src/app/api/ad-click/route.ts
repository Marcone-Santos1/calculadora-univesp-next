import { NextRequest, NextResponse } from "next/server";
import { trackAdClick } from "@/actions/ad-engine";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  // 🛡️ Rate limit: máximo 10 cliques por minuto por IP
  const ip = getClientIP(req.headers);
  const { success } = rateLimit(`ad-click:${ip}`, 10, 60_000);
  if (!success) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  const searchParams = req.nextUrl.searchParams;
  const adId = searchParams.get("adId");
  const campaignId = searchParams.get("campaignId");
  const destinationUrl = searchParams.get("dest");

  if (!adId || !campaignId || !destinationUrl) {
    return new NextResponse("Invalid Request", { status: 400 });
  }

  // 🔥 Rastreamento e Cobrança (Backend)
  // Como isso roda no servidor, é seguro e garantido.
  try {
    // Nota: Aqui não precisamos de await se quisermos velocidade máxima (Fire and Forget),
    // mas para garantir a cobrança no MVP, usamos await.
    await trackAdClick(adId, campaignId);
  } catch (error) {
    console.error("Erro ao rastrear clique:", error);
    // Mesmo com erro no tracking, NÃO impeça o usuário de ir para o site.
  }

  // 🚀 Redirecionamento Final
  return NextResponse.redirect(destinationUrl);
}