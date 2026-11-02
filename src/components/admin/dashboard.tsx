'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, FileText, FolderGit2, Inbox, Plus } from 'lucide-react';
import { dateText, errorText, request } from './api';
import { Heading, Loading, Notice } from './ui';

type Activity = {
  id?: string;
  action?: string;
  resource?: string;
  actor?: string;
  createdAt?: string;
  title?: string;
};
type Stats = {
  totalProjects: number;
  publishedProjects: number;
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  unreadMessages: number;
  recentActivity: Activity[];
};
export default function Dashboard() {
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => request<Stats>('/admin/dashboard'),
  });
  return (
    <>
      <Heading
        code="SYSTEM_OVERVIEW"
        title="Your publishing workspace"
        description="A clear view of your portfolio, content, and conversations."
      >
        <Link className="admin-button" href="/admin/blog/new">
          <Plus size={16} /> Create article
        </Link>
      </Heading>
      <Notice error={query.error ? errorText(query.error) : undefined} />
      {query.isPending ? (
        <Loading />
      ) : (
        query.data && (
          <>
            <div className="admin-stats">
              {[
                {
                  label: 'Projects',
                  value: query.data.totalProjects,
                  detail: `${query.data.publishedProjects} published`,
                  icon: FolderGit2,
                  href: '/admin/projects',
                },
                {
                  label: 'Articles',
                  value: query.data.totalArticles,
                  detail: `${query.data.publishedArticles} published`,
                  icon: FileText,
                  href: '/admin/blog',
                },
                {
                  label: 'Draft articles',
                  value: query.data.draftArticles,
                  detail: 'Work in progress',
                  icon: FileText,
                  href: '/admin/blog?status=DRAFT',
                },
                {
                  label: 'Unread messages',
                  value: query.data.unreadMessages,
                  detail: 'Awaiting your attention',
                  icon: Inbox,
                  href: '/admin/messages?status=UNREAD',
                },
              ].map((stat) => (
                <Link key={stat.label} href={stat.href} className="admin-stat">
                  <div>
                    <span>{stat.label}</span>
                    <stat.icon size={17} />
                  </div>
                  <strong>{stat.value}</strong>
                  <p>
                    {stat.detail}
                    <ArrowUpRight size={14} />
                  </p>
                </Link>
              ))}
            </div>
            <div className="admin-dashboard-grid">
              <section className="admin-panel">
                <div className="admin-panel-title">
                  <h2>Recent activity</h2>
                  <span className="admin-eyebrow">DATABASE / LIVE</span>
                </div>
                {query.data.recentActivity?.length ? (
                  <ul className="admin-activity">
                    {query.data.recentActivity.map((item, index) => (
                      <li key={item.id || index}>
                        <span className="admin-activity-marker" />
                        <div>
                          <strong>{item.action?.replaceAll('_', ' ') || item.title}</strong>
                          <p>
                            {item.resource || 'Content'}
                            {item.actor ? ` · ${item.actor}` : ''}
                          </p>
                        </div>
                        <time>{dateText(item.createdAt)}</time>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="admin-empty">
                    <p>Your next edit starts the activity log.</p>
                  </div>
                )}
              </section>
              <section className="admin-panel">
                <div className="admin-panel-title">
                  <h2>Quick actions</h2>
                  <span>↗</span>
                </div>
                <div className="admin-quick-actions">
                  {[
                    ['Add a project', '/admin/projects/new', 'Document your engineering work'],
                    ['Edit your profile', '/admin/profile', 'Keep your introduction current'],
                    ['Upload media', '/admin/media', 'Images and resume documents'],
                    ['View your site', '/', 'See what your visitors see'],
                  ].map(([label, href, detail]) => (
                    <Link href={href} key={href}>
                      <div>
                        <strong>{label}</strong>
                        <p>{detail}</p>
                      </div>
                      <ArrowUpRight size={18} />
                    </Link>
                  ))}
                </div>
              </section>
            </div>
            <div className="admin-alert">
              <span className="admin-dot" />
              <p>
                Drafts stay private. Publish content when it is ready, and your public site updates
                without a redeployment.
              </p>
            </div>
          </>
        )
      )}
    </>
  );
}
