// 'use client';

// import { useState, useEffect } from 'react';
// import { getMyPurchases, PurchaseRecord } from '@/lib/api/payments';
// import { CourseCard } from './CourseCard';
// import { transformPurchaseToCardProps, groupPurchasesByType, PurchaseDisplayItem } from '@/utils/purchaseTransformers';

// interface PurchaseTabContentProps {
//   // No props needed - handles its own data fetching
// }

// export function PurchaseTabContent({}: PurchaseTabContentProps) {
//   const [purchases, setPurchases] = useState<PurchaseDisplayItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchPurchases = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await getMyPurchases();
      
//       if (response.success) {
//         // Transform purchase records to CourseCard-compatible format
//         const transformedPurchases = response.purchases.map(transformPurchaseToCardProps);
//         setPurchases(transformedPurchases);
//       } else {
//         setError('Failed to load purchases');
//       }
//     } catch (err) {
//       setError('An error occurred while loading your purchases');
//       console.error('Error fetching purchases:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPurchases();
//   }, []);

//   const handleRetry = () => {
//     fetchPurchases();
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
//           <p className="text-text-muted">Loading your purchases...</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="text-center">
//           <p className="text-red-400 mb-4">{error}</p>
//           <button
//             onClick={handleRetry}
//             className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Empty state
//   if (purchases.length === 0) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="text-center">
//           <p className="text-text-muted mb-4">You haven't made any purchases yet.</p>
//           <p className="text-text-muted/70 text-sm">
//             Explore our classes to find content you'd like to purchase.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Group purchases by type
//   const groupedPurchases = groupPurchasesByType(purchases);

//   return (
//     <div className="space-y-8">
//       {/* Video Purchases Section */}
//       {groupedPurchases.videos.length > 0 && (
//         <div>
//           <h3 className="text-lg font-semibold text-text-primary mb-4">
//             Video Courses ({groupedPurchases.videos.length})
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {groupedPurchases.videos.map((purchase) => (
//               <CourseCard
//                 key={purchase.id}
//                 id={purchase.id}
//                 title={purchase.title}
//                 description={purchase.description}
//                 instructor={purchase.instructor}
//                 thumbnail={purchase.thumbnail}
//                 avatar={purchase.avatar}
//                 price={purchase.price}
//                 duration={purchase.duration}
//                 posted={purchase.posted}
//                 rating={purchase.rating}
//                 reviews={purchase.reviews}
//                 isLive={purchase.isLive}
//                 isPurchased={purchase.isPurchased}
//                 purchaseDate={purchase.purchaseDate}
//                 paymentStatus={purchase.paymentStatus}
//                 purchaseAmount={purchase.purchaseAmount}
//                 currency={purchase.currency}
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Live Session Purchases Section */}
//       {groupedPurchases.live.length > 0 && (
//         <div>
//           <h3 className="text-lg font-semibold text-text-primary mb-4">
//             Live Sessions ({groupedPurchases.live.length})
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {groupedPurchases.live.map((purchase) => (
//               <CourseCard
//                 key={purchase.id}
//                 id={purchase.id}
//                 title={purchase.title}
//                 description={purchase.description}
//                 instructor={purchase.instructor}
//                 thumbnail={purchase.thumbnail}
//                 avatar={purchase.avatar}
//                 price={purchase.price}
//                 duration={purchase.duration}
//                 posted={purchase.posted}
//                 rating={purchase.rating}
//                 reviews={purchase.reviews}
//                 isLive={purchase.isLive}
//                 isPurchased={purchase.isPurchased}
//                 purchaseDate={purchase.purchaseDate}
//                 paymentStatus={purchase.paymentStatus}
//                 purchaseAmount={purchase.purchaseAmount}
//                 currency={purchase.currency}
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Refresh Button */}
//       <div className="flex justify-center pt-4">
//         <button
//           onClick={handleRetry}
//           className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors text-sm"
//         >
//           Refresh Purchases
//         </button>
//       </div>
//     </div>
//   );
// }