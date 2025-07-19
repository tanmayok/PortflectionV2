import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";

export const revalidate = 3600; // Regenerate every 1 hour

// Generate metadata for this page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  
  const portfolio = await prisma.portfolio.findFirst({
    where: {
      OR: [
        { id },
        { publishedUrl: { endsWith: id } }
      ],
      isPublished: true
    }
  });

  if (!portfolio) {
    return {
      title: "Portfolio Not Found",
      description: "The requested portfolio could not be found.",
    };
  }

  return {
    title: `${portfolio.name} - Portfolio`,
    description: `View ${portfolio.name}'s professional portfolio`,
    openGraph: {
      title: `${portfolio.name} - Portfolio`,
      description: `View ${portfolio.name}'s professional portfolio`,
      type: "profile",
      siteName: "Portfolio Builder",
    },
  };
}

// Main page component
export default async function PortfolioPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  const portfolio = await prisma.portfolio.findFirst({
    where: {
      OR: [
        { id: params.id },
        { publishedUrl: { endsWith: params.id } }
      ],
      isPublished: true
    }
  });
  
  if (!portfolio) notFound();

  const sections = (portfolio.extraData as any)?.sections || [];

  return (
    <div className="min-h-screen bg-white">
      {sections.map((section: any) => (
        <div
          key={section.id}
          className="p-8 border-b border-gray-100 last:border-b-0"
        >
          <h2 className="text-2xl font-bold mb-4 text-blue-600">
            {section.title}
          </h2>

          {section.type === 'hero' && (
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">{section.content.name || 'Your Name'}</h1>
              <h2 className="text-2xl text-gray-600">{section.content.title || 'Your Title'}</h2>
              <p className="text-lg text-gray-700">{section.content.description || 'Your description'}</p>
            </div>
          )}

          {section.type === 'about' && (
            <div>
              <p className="text-lg leading-relaxed text-gray-700">
                {section.content.content || 'Tell your story here...'}
              </p>
            </div>
          )}

          {section.type === 'skills' && (
            <div className="flex flex-wrap gap-2">
              {(section.content.skills || []).map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {section.type === 'projects' && (
            <div className="grid gap-6 md:grid-cols-2">
              {(section.content.projects || []).map((project: any, index: number) => (
                <div key={index} className="border rounded-lg p-6 shadow-sm">
                  <h3 className="font-semibold text-xl mb-2">{project.title || 'Project Title'}</h3>
                  <p className="text-gray-600 mb-4">{project.description || 'Project description'}</p>
                  
                  {project.links && project.links.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {project.links.map((link: any, linkIndex: number) => (
                        <a
                          key={linkIndex}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          {link.label || 'Link'}
                        </a>
                      ))}
                    </div>
                  )}
                  
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.tags.map((tag: string, tagIndex: number) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {section.type === 'contact' && (
            <div className="space-y-4">
              <p className="text-lg">
                <strong>Email:</strong> {section.content.email || 'your.email@example.com'}
              </p>
              <p className="text-lg">
                <strong>Phone:</strong> {section.content.phone || '+1 (555) 123-4567'}
              </p>
              <p className="text-lg">{section.content.message || 'Get in touch with me!'}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}