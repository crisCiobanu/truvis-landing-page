import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import type { CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

interface BlogSearchProps {
  posts: BlogPost[];
  viewMode?: 'list' | 'grid';
  gridColumns?: '2' | '3' | '4';
  placeholder?: string;
  className?: string;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function BlogSearch({
  posts,
  viewMode = 'list',
  gridColumns = '2',
  placeholder = 'Search posts by title or excerpt...',
  className,
}: BlogSearchProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredPosts = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return posts;
    }

    const query = searchQuery.toLowerCase();

    return posts.filter((post) => {
      const title = post.data.title.toLowerCase();
      const excerpt = post.data.excerpt.toLowerCase();

      return title.includes(query) || excerpt.includes(query);
    });
  }, [posts, searchQuery]);

  return (
    <div className={className}>
      <div className="mb-6">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        {searchQuery && (
          <p className="text-muted-foreground mt-2 text-sm">
            Found {filteredPosts.length}{' '}
            {filteredPosts.length === 1 ? 'post' : 'posts'}
          </p>
        )}
      </div>

      {filteredPosts.length === 0 && searchQuery ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-lg">
            No posts found matching "{searchQuery}"
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            Try a different search term
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? `grid grid-cols-1 gap-4 sm:gap-6 ${
                  gridColumns === '2'
                    ? 'sm:grid-cols-2'
                    : gridColumns === '3'
                      ? 'sm:grid-cols-3'
                      : 'sm:grid-cols-4'
                }`
              : 'space-y-4 sm:space-y-6'
          }
        >
          {filteredPosts.map((entry) => (
            <Card
              key={entry.slug}
              className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${
                viewMode === 'list' ? 'flex' : 'hover:-translate-y-1'
              }`}
            >
              <a
                href={`/blog/${entry.slug}`}
                className={`block transition-opacity hover:opacity-80 ${
                  viewMode === 'list' ? 'flex flex-1' : ''
                }`}
              >
                {viewMode === 'list' && (
                  <div className="w-48 shrink-0">
                    <img
                      src={entry.data.featuredImage.src}
                      alt={entry.data.featuredImage.alt}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Badge variant="secondary">{entry.data.category}</Badge>
                    <span className="text-muted-foreground ml-auto flex items-center text-sm">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDate(new Date(entry.data.publishDate))}
                    </span>
                  </div>
                  <h2 className="mb-2 text-2xl font-bold">
                    {entry.data.title}
                  </h2>
                  <p className="text-muted-foreground">{entry.data.excerpt}</p>
                </div>
                {viewMode === 'grid' && (
                  <div className="aspect-video w-full">
                    <img
                      src={entry.data.featuredImage.src}
                      alt={entry.data.featuredImage.alt}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
