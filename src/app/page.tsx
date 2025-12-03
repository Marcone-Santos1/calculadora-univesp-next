import { GradeCalculator } from "@/components/GradeCalculator";
import { Content } from "@/components/Content";
import { RecentPosts } from "@/components/blog/RecentPosts";

export default function HomePage() {
  return (
    <>
      <GradeCalculator />
      <Content />
      <RecentPosts />
    </>
  );
}