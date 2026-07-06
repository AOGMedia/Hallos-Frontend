// Data passed as props to the root component
export const mockRootProps = {
  user: {
    name: 'Alex Chapman',
    avatar: '/avatars/alex-chapman-instructor.jpg'
  },
  stats: {
    totalVideos: 17,
    liveSchedules: 0,
  },
  featuredVideo: {
    id: '1',
    title: `Quiz Game Contest by Hallos`,
    thumbnail: 'https://res.cloudinary.com/dblsgkbk4/image/upload/v1760998525/card2_avruc9.png',
    date: new Date('2026-2-15'),
    category: 'Gaming' as const,
    views: 300,
    isLive: false
  },

};