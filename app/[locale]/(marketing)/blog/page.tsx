  "use client"

  import { useEffect, useState } from 'react'
  import Link from 'next/link'
  import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
  import { blogService, BlogPost } from '@/services/blogService'
  import { Skeleton } from '@/components/ui/skeleton'

  export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const fetchPosts = async () => {
        const posts = await blogService.getAllPosts()
        setPosts(posts)
        setLoading(false)
      }
      fetchPosts()
    }, [])

    if (loading) {
      return (
        <div className="container">
          <h1 className="text-5xl font-bold text-center mb-12">Blog</h1>
          <p className="mt-2 text-xl text-muted-foreground">What's New?</p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[400px] w-full" />
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="container py-20">
        <h1 className="text-4xl font-bold text-center mb-12">Blog</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} prefetch={false}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover rounded-t-lg" />
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold leading-none tracking-tight" asChild>
  <h1>{post.title}</h1>
</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">{post.excerpt}</p>
                  <p className="text-sm text-muted-foreground">{post.date}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    )
  }
