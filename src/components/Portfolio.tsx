import { safeFetchList } from '@/sanity/fetch';
import { portfolioProjectsQuery } from '@/sanity/queries';
import type { PortfolioProjectData } from '@/sanity/types';
import PortfolioSlider from './PortfolioSlider';

export default async function Portfolio() {
  const projects = await safeFetchList<PortfolioProjectData>(portfolioProjectsQuery);
  return <PortfolioSlider projects={projects} />;
}
