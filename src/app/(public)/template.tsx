import { PageMotion } from '@/components/public/page-motion';

export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <PageMotion>{children}</PageMotion>;
}
