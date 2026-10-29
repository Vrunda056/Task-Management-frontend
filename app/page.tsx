"use client";

import Link from "next/link";
import { useProjects } from "@/lib/projects/use-project";
import { useAuth } from "@/lib/auth/auth-context";

const tasks = [
  {
    title: "Finalize homepage wireframes",
    project: "Website redesign",
    initials: "AM",
    color: "lavender",
    due: "Today",
    status: "In progress",
    statusColor: "blue",
  },
  {
    title: "Review Q4 campaign brief",
    project: "Marketing campaign",
    initials: "JL",
    color: "peach",
    due: "Today",
    status: "In review",
    statusColor: "amber",
  },
  {
    title: "Update component library",
    project: "Website redesign",
    initials: "SK",
    color: "mint",
    due: "Tomorrow",
    status: "To do",
    statusColor: "gray",
  },
  {
    title: "Prepare sprint retrospective",
    project: "Product sprint",
    initials: "RD",
    color: "sky",
    due: "Oct 18",
    status: "To do",
    statusColor: "gray",
  },
];

export default function Home() {
  const projectsQuery = useProjects();
  const { user } = useAuth();
  const isManager = user?.role === "MANAGER";

  return (
    <div className="dashboard">
      <section className="welcome-row">
        <div>
          <h1>Good morning, Alex <span aria-hidden="true">✦</span></h1>
          <p className="welcome-copy">Here&apos;s what&apos;s happening with your workspace today.</p>
        </div>
      </section>

      <section aria-label="Workspace overview" className="stats-grid">
        <article className="stat-card">
          <div className="stat-top"><span className="stat-icon violet-icon">▣</span><span className="stat-trend positive">↗ 12%</span></div>
          <p className="stat-label">Total tasks</p><p className="stat-value">48</p>
          <p className="stat-footnote">Compared to last month</p>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span className="stat-icon blue-icon">◷</span><span className="stat-trend positive">↗ 8%</span></div>
          <p className="stat-label">In progress</p><p className="stat-value">18</p>
          <p className="stat-footnote">Across 6 active projects</p>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span className="stat-icon green-icon">✓</span><span className="stat-trend positive">↗ 24%</span></div>
          <p className="stat-label">Completed</p><p className="stat-value">26</p>
          <p className="stat-footnote">You&apos;re on a great streak</p>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span className="stat-icon orange-icon">⚑</span><span className="stat-trend neutral">This week</span></div>
          <p className="stat-label">Due soon</p><p className="stat-value">4</p>
          <p className="stat-footnote">Keep your projects moving</p>
        </article>
      </section>

      <div className="dashboard-grid">
        <section aria-labelledby="tasks-heading" className="panel tasks-panel">
          <div className="panel-heading">
            <div><h2 id="tasks-heading">My tasks</h2><p>Your focus for the week</p></div>
            <Link className="projects-view-all" href="/tasks">Open Task Tracker →</Link>
          </div>
          <div className="task-table-wrap">
            <table className="task-table">
              <thead><tr><th>Task</th><th>Assignee</th><th>Due date</th><th>Status</th></tr></thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.title}>
                    <td><span className="task-check" aria-hidden="true" /><span className="task-name">{task.title}<small>{task.project}</small></span></td>
                    <td><span className={`avatar avatar-${task.color}`}>{task.initials}</span></td>
                    <td className="due-date">{task.due}</td>
                    <td><span className={`status-pill status-${task.statusColor}`}>{task.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="table-footer">You&apos;re all caught up on your priority tasks.</p>
        </section>

        <section aria-labelledby="projects-heading" className="panel projects-panel">
          <div className="panel-heading">
            <div><h2 id="projects-heading">Your projects</h2><p>Projects in your workspace</p></div>
            <Link className="projects-view-all" href="/projects">View all</Link>
          </div>
          {projectsQuery.isPending && (
            <p className="dashboard-project-state" role="status">Loading projects...</p>
          )}
          {projectsQuery.isError && (
            <p className="dashboard-project-state dashboard-project-error" role="alert">
              Could not load projects: {projectsQuery.error.message}
            </p>
          )}
          {projectsQuery.isSuccess && projectsQuery.data.length === 0 && (
            <div className="dashboard-project-state">
              <p>No projects yet.</p>
              {isManager && (
                <Link href="/projects">Create your first project</Link>
              )}
            </div>
          )}
          {projectsQuery.isSuccess && projectsQuery.data.length > 0 && (
            <div className="project-list">
              {projectsQuery.data.slice(0, 4).map((project, index) => (
                <article className="project-item" key={project.id}>
                  <div className="project-item-heading">
                    <span className={"project-mark mark-" + ["purple", "orange", "green"][index % 3]} aria-hidden="true">&#10033;</span>
                    <h3>{project.name}</h3>
                  </div>
                  <p className="project-item-description">
                    {project.description || "No description provided."}
                  </p>
                  <p className="project-item-owner">
                    {project.createdBy?.name ?? "Owner unavailable"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <section aria-labelledby="activity-heading" className="panel activity-panel">
        <div className="panel-heading">
          <div><h2 id="activity-heading">Recent activity</h2><p>The latest updates from your team</p></div>
          <span className="activity-period">Today</span>
        </div>
        <div className="activity-list">
          <div className="activity-item"><span className="avatar avatar-lavender">AM</span><p><strong>Alex Morgan</strong> completed <b>Set up project workspace</b><small>Website redesign · 10 minutes ago</small></p><span className="activity-check">✓</span></div>
          <div className="activity-item"><span className="avatar avatar-peach">JL</span><p><strong>Jamie Lee</strong> added a new task <b>Review visual direction</b><small>Website redesign · 1 hour ago</small></p><span className="activity-dot" /></div>
          <div className="activity-item"><span className="avatar avatar-mint">SK</span><p><strong>Sam Kim</strong> moved <b>Campaign brief</b> to In review<small>Marketing campaign · 2 hours ago</small></p><span className="activity-dot" /></div>
        </div>
      </section>
    </div>
  );
}
