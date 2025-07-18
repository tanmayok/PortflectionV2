import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/prisma";

export const revalidate = 3600; // Regenerate every 1 hour

// Generate metadata for this page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  const portfolio = await prisma.portfolio.findFirst({
    where: {
      OR: [
        { publishedUrl: { contains: slug } },
        { extraData: { path: ['slug'], equals: slug } }
      ],
      isPublished: true
    }
  });

  if (!portfolio) {
    return {
      title: "Portfolio Not Found | Portflection",
      description: "The requested portfolio could not be found.",
    };
  }

  const portfolioData = portfolio.extraData as any;
  const name = portfolio.name || "Portfolio";
  const title = portfolio.title || "";
  const description = portfolio.about || `View ${name}'s portfolio`;

  return {
    title: `${name} - ${title} | Portfolio`,
    description,
    openGraph: {
      title: `${name} - ${title}`,
      description,
      type: "profile",
      siteName: "Portflection",
      locale: "en_US",
      url: portfolio.publishedUrl || `https://portflection.com/portfolio/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} - ${title}`,
      description,
      creator: "@portflection",
      site: "@portflection",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Portfolio renderer component
const PortfolioRenderer = ({ portfolioData }: { portfolioData: any }) => {
  const sections = portfolioData.sections || [];
  
  return (
    <div className="min-h-screen bg-white">
      {sections
        .filter((section: any) => section.isVisible)
        .sort((a: any, b: any) => a.order - b.order)
        .map((section: any) => (
          <section key={section.id} className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">
                {section.title || section.type}
              </h2>
              
              {/* Render section content based on type */}
              {section.type === 'hero' && (
                <div className="text-center space-y-4">
                  <h1 className="text-5xl font-bold">{section.content.name}</h1>
                  <h2 className="text-2xl text-gray-600">{section.content.title}</h2>
                  <p className="text-lg max-w-2xl mx-auto">{section.content.description}</p>
                </div>
              )}
              
              {section.type === 'about' && (
                <div className="max-w-4xl mx-auto">
                  <p className="text-lg leading-relaxed">{section.content.about}</p>
                </div>
              )}
              
              {section.type === 'projects' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold">{section.content.title}</h3>
                  <p className="text-gray-600">{section.content.description}</p>
                  
                  {section.content.links && (
                    <div className="flex flex-wrap gap-3">
                      {section.content.links.map((link: any, index: number) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {link.icon && <span>{link.icon}</span>}
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                  
                  {section.content.tags && (
                    <div className="flex flex-wrap gap-2">
                      {section.content.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {section.type === 'skills' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(section.content.skills || []).map((skill: string, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg text-center font-medium"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              )}
              
              {section.type === 'contact' && (
                <div className="max-w-md mx-auto space-y-4">
                  {section.content.email && (
                    <div>
                      <strong>Email:</strong> 
                      <a href={`mailto:${section.content.email}`} className="ml-2 text-blue-600">
                        {section.content.email}
                      </a>
                    </div>
                  )}
                  {section.content.phone && (
                    <div>
                      <strong>Phone:</strong> {section.content.phone}
                    </div>
                  )}
                  {section.content.location && (
                    <div>
                      <strong>Location:</strong> {section.content.location}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        ))}
    </div>
  );
};

// Main page component
export default async function PublicPortfolioPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  
  const portfolio = await prisma.portfolio.findFirst({
    where: {
      OR: [
        { publishedUrl: { contains: params.slug } },
        { extraData: { path: ['slug'], equals: params.slug } }
      ],
      isPublished: true
    }
  });
  
  if (!portfolio) notFound();

  // Track view
  await prisma.portfolio.update({
    where: { id: portfolio.id },
    data: { views: { increment: 1 } }
  });

  const portfolioData = portfolio.extraData as any;

  return <PortfolioRenderer portfolioData={portfolioData} />;
}