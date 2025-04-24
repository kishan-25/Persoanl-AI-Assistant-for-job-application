"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Typewriter from "typewriter-effect";
import CountUp from "react-countup";
import { FiArrowRight, FiCheckCircle, FiClock, FiSettings, FiUser } from "react-icons/fi";

export default function Home() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [dots, setDots] = useState([]);
  
  useEffect(() => {
    setIsLoaded(true);
    
    // Generate dots only on the client side to avoid hydration mismatch
    const newDots = Array.from({ length: 50 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2
    }));
    setDots(newDots);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const [howItWorksRef, howItWorksInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [whyChooseRef, whyChooseInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [companiesRef, companiesInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 text-black">
        {/* Hero Section */}
        <motion.div 
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
          className="relative bg-blue-900 text-white overflow-hidden"
        >
          <div className="absolute inset-0">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ duration: 1.5 }}
            />
            {/* Background animation dots - Rendered client-side only to prevent hydration mismatch */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ duration: 2 }}
            >
              {dots.map((dot, index) => (
                <motion.div
                  key={index}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{
                    left: dot.left,
                    top: dot.top
                  }}
                  animate={{
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: dot.duration,
                    repeat: Infinity,
                    delay: dot.delay
                  }}
                />
              ))}
            </motion.div>
          </div>

          <main className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <motion.h1 
                className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl mb-4"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
              >
                Find Your Dream Tech Job
              </motion.h1>
              <motion.div 
                className="text-xl text-blue-200 max-w-2xl mx-auto h-16 "
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
              >
                <Typewriter
                  options={{
                    strings: [
                      "Discover software engineering opportunities that match your skills",
                      "Find top tech companies hiring now",
                      "Find remote, hybrid, or in-person positions"
                    ],
                    autoStart: true,
                    loop: true,
                    delay: 40,
                    deleteSpeed: 20
                  }}
                />
              </motion.div>
              <motion.div 
                className="mt-10 flex justify-center space-x-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
  
              </motion.div>
              
              <motion.div 
                className="mt-12 flex justify-center space-x-12"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.6 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    <CountUp end={500} suffix="+" duration={2.5} />
                  </div>
                  <div className="text-blue-200">Active Jobs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    <CountUp end={200} suffix="+" duration={2.5} />
                  </div>
                  <div className="text-blue-200">Companies</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    <CountUp end={150} suffix="+" duration={2.5} />
                  </div>
                  <div className="text-blue-200">Developers</div>
                </div>
              </motion.div>
            </div>
          </main>
        </motion.div>

        {/* How It Works */}
        <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <motion.div 
            ref={howItWorksRef}
            variants={fadeIn}
            initial="hidden"
            animate={howItWorksInView ? "visible" : "hidden"}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-2">How It Works</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
              Our streamlined process helps you find and apply to the perfect positions with ease
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate={howItWorksInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div 
              variants={cardVariant}
              className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600 hover:shadow-xl transition-shadow duration-300"
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FiUser className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">1. Create Your Profile</h3>
              <p className="text-gray-600 text-center">
                Add your skills, experience, and preferences so we can find the right jobs for you.
              </p>
            </motion.div>

            <motion.div 
              variants={cardVariant}
              className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600 hover:shadow-xl transition-shadow duration-300"
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FiCheckCircle className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">2. Browse Matched Jobs</h3>
              <p className="text-gray-600 text-center">
                We will show you positions that align with your profile and career aspirations.
              </p>
            </motion.div>

            <motion.div 
              variants={cardVariant}
              className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600 hover:shadow-xl transition-shadow duration-300"
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FiArrowRight className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">3. Apply With Ease</h3>
              <p className="text-gray-600 text-center">
                Submit applications directly through our platform and track your progress.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Why Choose JobHunter */}
        <div className="bg-gray-100 py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              ref={whyChooseRef}
              variants={fadeIn}
              initial="hidden"
              animate={whyChooseInView ? "visible" : "hidden"}
              className="text-center"
            >
              <h2 className="text-3xl font-bold mb-2">Why Choose JobHunter</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
              <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
                We&apos;ve built powerful tools to help developers find their perfect career match
              </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate={whyChooseInView ? "visible" : "hidden"}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <motion.div 
                variants={cardVariant}
                className="bg-white p-6 rounded-lg shadow-lg flex"
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                <div className="mr-6 text-blue-600">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiSettings className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Smart Matching Algorithm</h3>
                  <p className="text-gray-600">
                    Our AI-powered system connects you with jobs that truly match your skills and career goals.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                variants={cardVariant}
                className="bg-white p-6 rounded-lg shadow-lg flex"
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                <div className="mr-6 text-blue-600">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiArrowRight className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Faster Application Process</h3>
                  <p className="text-gray-600">
                    Apply to multiple positions with just a few clicks using your saved information.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                variants={cardVariant}
                className="bg-white p-6 rounded-lg shadow-lg flex"
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                <div className="mr-6 text-blue-600">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiClock className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Real-Time Updates</h3>
                  <p className="text-gray-600">
                    Get notified instantly when new opportunities match your profile or when employers respond.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                variants={cardVariant}
                className="bg-white p-6 rounded-lg shadow-lg flex"
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                <div className="mr-6 text-blue-600">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiUser className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Personalized Dashboard</h3>
                  <p className="text-gray-600">
                    Track your applications, interviews, and offers all in one centralized location.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Featured Companies */}
        <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <motion.div 
            ref={companiesRef}
            variants={fadeIn}
            initial="hidden"
            animate={companiesInView ? "visible" : "hidden"}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-2">Featured Companies</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Top tech companies that are actively hiring software engineers through our platform
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate={companiesInView ? "visible" : "hidden"}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[1, 2, 3, 4].map((logo, index) => (
              <motion.div
                key={index}
                variants={cardVariant}
                className="h-24 bg-white shadow-md rounded-lg flex items-center justify-center hover:shadow-xl transition-shadow duration-300"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
              >
                <div className="text-gray-700 font-semibold">Logo {logo}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Ready to Find Your Next Opportunity?
            </motion.h2>
            <motion.p 
              className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              Join thousands of software engineers who have found their dream jobs through JobHunter.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.button
                onClick={() => router.push("/register")}
                className="px-8 py-4 bg-white text-blue-600 text-lg font-medium rounded-md hover:bg-blue-50 shadow-lg inline-flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Get Started Today</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <FiArrowRight />
                </motion.span>
              </motion.button>
            </motion.div>
            
            <motion.div 
              className="mt-12 bg-white/10 rounded-lg p-8 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="text-xl font-semibold mb-4">What Our Users Say</div>
              <div className="flex flex-col md:flex-row justify-between space-y-6 md:space-y-0 md:space-x-6">
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                  <p className="italic text-blue-100">I found my dream job at a Silicon Valley startup within two weeks of signing up.</p>
                  <p className="mt-2 font-medium">- Sarah J., Software Engineer</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                  <p className="italic text-blue-100">The personalized job matches saved me hours of searching through irrelevant postings.</p>
                  <p className="mt-2 font-medium">- Michael T., Full Stack Developer</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <motion.h3 
                  className="text-xl font-semibold mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  JobHunter
                </motion.h3>
                <motion.p 
                  className="text-gray-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Connecting talented developers with great companies since 2023.
                </motion.p>
              </div>

              <div>
                <motion.h3 
                  className="text-xl font-semibold mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  Quick Links
                </motion.h3>
                <motion.ul 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white transition-colors">About Us</Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white transition-colors">For Employers</Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white transition-colors">Blog</Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white transition-colors">FAQ</Link>
                  </li>
                </motion.ul>
              </div>

              <div>
                <motion.h3 
                  className="text-xl font-semibold mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  Resources
                </motion.h3>
                <motion.ul 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  
                </motion.ul>
              </div>

              <div>
                <motion.h3 
                  className="text-xl font-semibold mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  Contact Us
                </motion.h3>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <p className="text-gray-300 mb-4">
                    Have questions? Reach out to our support team.
                  </p>
                  <motion.button 
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Contact Support
                  </motion.button>
                </motion.div>
              </div>
            </div>
            
            <motion.div 
              className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
            >
              <p>&copy; {new Date().getFullYear()} JobHunter. All rights reserved.</p>
            </motion.div>
          </div>
        </footer>
      </div>
    </>
  );
}