// import React from 'react';
// import { Link } from 'react-router-dom';

// const RoleSelection = () => {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
//       <div className="max-w-4xl w-full">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">
//             Welcome to AyurSutra Wellness
//           </h1>
//           <p className="text-lg text-gray-600">
//             Choose your role to access the appropriate dashboard
//           </p>
//         </div>

//         {/* Role Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           {/* Patient Card */}
//           <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
//             <div className="text-center">
//               <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <span className="text-4xl">🧘‍♀️</span>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-4">Patient</h3>
//               <p className="text-gray-600 mb-8">
//                 Access your health records, book appointments, and track your wellness journey
//               </p>
//               <div className="space-y-4">
//                 <Link
//                   to="/auth/patient/login"
//                   className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
//                 >
//                   Login as Patient
//                 </Link>
//                 <Link
//                   to="/auth/patient/register"
//                   className="block w-full border border-green-600 text-green-600 py-3 px-6 rounded-lg font-medium hover:bg-green-50 transition-colors duration-200"
//                 >
//                   Register as Patient
//                 </Link>
//               </div>
//             </div>
//           </div>

//           {/* Hospital Card */}
//           <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
//             <div className="text-center">
//               <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <span className="text-4xl">🏥</span>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-4">Hospital</h3>
//               <p className="text-gray-600 mb-8">
//                 Manage your hospital operations, staff, and patient care services
//               </p>
//               <div className="space-y-4">
//                 <Link
//                   to="/auth/hospital/login"
//                   className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
//                 >
//                   Login as Hospital
//                 </Link>
//                 <Link
//                   to="/auth/hospital/register"
//                   className="block w-full border border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200"
//                 >
//                   Register Hospital
//                 </Link>
//               </div>
//             </div>
//           </div>

//           {/* Doctor Card */}
//           <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
//             <div className="text-center">
//               <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <span className="text-4xl">👨‍⚕️</span>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-4">Doctor</h3>
//               <p className="text-gray-600 mb-8">
//                 Access your practice management tools and patient consultation platform
//               </p>
//               <div className="space-y-4">
//                 <Link
//                   to="/auth/doctor/login"
//                   className="block w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200"
//                 >
//                   Login as Doctor
//                 </Link>
//                 <div className="text-sm text-gray-500 py-3">
//                   Doctor registration is handled by hospitals
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="text-center mt-12">
//           <p className="text-gray-500">
//             Need help? <Link to="/contact" className="text-green-600 hover:text-green-700">Contact Support</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RoleSelection;