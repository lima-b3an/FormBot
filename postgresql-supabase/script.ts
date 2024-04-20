import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

async function main() {
  // // Retrieve all published posts
  // const allPosts = await prisma.post.findMany({
  //   where: { published: true },
  // })
  // console.log('Retrieved all published posts: ', allPosts)

  // Create a new post (written by an already existing user with email alice@prisma.io)
  const newPost = await prisma.post.create({
    data: {
      title: "what",
      content: 'heyo',
      published: true,
      author: {
        connect: {
          email: "alice@prisma.io"
        }
      }
    },
  })
  console.log('Created a new post:', newPost)

  // Publish the new post
  // const updatedPost = await prisma.post.update({
  //   where: {
  //     id: 1
  //   },
  //   data: {
  //     published: true,
  //   },
  // })
  // console.log(`Published the newly created post: `, updatedPost)

  // const updatedUser = await prisma.user.update({
  //   where: {
  //     email: "alice@prisma.io",
  //   },
  //   data: {
  //     name: "Alice Unknown"
  //   }
  // })

  // console.log(`Updated user:`, updatedUser)

  // // Retrieve all posts by user with email alice@prisma.io
  const postsByUser = await prisma.user
    .findUnique({
      where: {
        email: 'alice@prisma.io',
      },
    })
    .posts()
  console.log(`Retrieved all posts from a specific user: `, postsByUser)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })