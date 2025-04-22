"use client"
import { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter } from 'lucide-react';

export default function About() {
  const [activeTab, setActiveTab] = useState('mission');

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const teamMembers = [
    { 
      name: 'Alex Chen', 
      role: 'CEO & Founder', 
      image: '/api/placeholder/100/100',
      bio: 'Former AI researcher with a passion for transforming the job market.'
    },
    { 
      name: 'Sarah Johnson', 
      role: 'CTO', 
      image: '/api/placeholder/100/100',
      bio: 'Machine learning expert specialized in natural language processing.'
    },
    { 
      name: 'Michael Lee', 
      role: 'Head of Product', 
      image: '/api/placeholder/100/100',
      bio: 'Product strategist focused on creating intuitive user experiences.'
    },
    { 
      name: 'Priya Patel', 
      role: 'Data Science Lead', 
      image: '/api/placeholder/100/100',
      bio: 'PhD in Computer Science with expertise in recommendation systems.'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Job Matches' },
    { number: '1M+', label: 'Users' },
    { number: '10K+', label: 'Companies' },
    { number: '95%', label: 'Satisfaction' }
  ];

  return (
    <>
      <Head>
        <title>About Us | AI Job Portal</title>
        <meta name="description" content="Learn about our AI-powered job matching platform" />
      </Head>

      <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
        {/* Hero Section */}
        <motion.section 
          className="pt-20 pb-16 px-6 md:px-10 lg:px-20 max-w-7xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
        >
          <motion.div variants={fadeIn} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Transforming Job Search with AI</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We&aposre on a mission to create perfect matches between talented individuals and forward-thinking companies.
            </p>
          </motion.div>

          <motion.div 
            className="relative h-64 md:h-96 rounded-2xl overflow-hidden my-12"
            variants={fadeIn}
          >
            <div className="absolute inset-0 bg-blue-900 opacity-20 z-10 rounded-2xl"></div>
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <h2 className="text-white text-3xl md:text-4xl font-bold text-center px-6">Matching the Right Talent with the Right Opportunity</h2>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 z-0"></div>
          </motion.div>
        </motion.section>

        {/* Tab Section */}
        <section className="py-16 px-6 md:px-10 lg:px-20 max-w-7xl mx-auto">
          <div className="mb-8 border-b border-gray-200">
            <div className="flex space-x-8">
              {['mission', 'technology', 'impact'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-1 text-lg font-medium transition-colors duration-300 ${
                    activeTab === tab 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-blue-500'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[300px]">
            {activeTab === 'mission' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-gray-800">Our Mission</h3>
                <p className="text-gray-600">
                  We believe that finding the right job shouldn&apost be a matter of luck or knowing the right people. 
                  Our AI-powered platform is designed to understand the unique skills, experiences, and preferences 
                  of each individual and match them with the perfect opportunities.
                </p>
                <p className="text-gray-600">
                  By gathering data from multiple sources and using advanced matching algorithms, we&aposre able to provide 
                  highly personalized job recommendations that go beyond simple keyword matching.
                </p>
                <div className="pt-4">
                  <motion.div 
                    className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h4 className="text-blue-800 font-semibold mb-2">Our Vision</h4>
                    <p className="text-gray-700">
                      A world where every person finds fulfilling work that matches their skills, values, and aspirations, 
                      and where organizations can quickly find the talent they need to thrive.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'technology' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-gray-800">Our Technology</h3>
                <p className="text-gray-600">
                  At the heart of our platform lies a sophisticated AI system that processes and analyzes data from 
                  various sources including resumes, job descriptions, company profiles, and market trends.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <motion.div 
                    className="bg-white p-6 rounded-lg shadow-md"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h4 className="text-xl font-semibold text-gray-800 mb-3">Natural Language Processing</h4>
                    <p className="text-gray-600">
                      Our NLP engine understands the nuances in job descriptions and resumes, extracting skills, 
                      experiences, and preferences that might be missed by traditional keyword-based systems.
                    </p>
                  </motion.div>
                  <motion.div 
                    className="bg-white p-6 rounded-lg shadow-md"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h4 className="text-xl font-semibold text-gray-800 mb-3">Machine Learning Matching</h4>
                    <p className="text-gray-600">
                      Our recommendation engine learns from successful placements and user feedback to continuously 
                      improve match quality and provide increasingly personalized suggestions.
                    </p>
                  </motion.div>
                  <motion.div 
                    className="bg-white p-6 rounded-lg shadow-md"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h4 className="text-xl font-semibold text-gray-800 mb-3">Data Integration</h4>
                    <p className="text-gray-600">
                      We gather data from multiple sources including job boards, company websites, and social media 
                      to provide a comprehensive view of the job market.
                    </p>
                  </motion.div>
                  <motion.div 
                    className="bg-white p-6 rounded-lg shadow-md"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h4 className="text-xl font-semibold text-gray-800 mb-3">Real-time Analysis</h4>
                    <p className="text-gray-600">
                      Our platform processes new job listings and user profiles in real-time, ensuring that 
                      recommendations are always up-to-date and relevant.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'impact' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-gray-800">Our Impact</h3>
                <p className="text-gray-600">
                  Since our launch, we&aposve helped thousands of job seekers find positions that truly match their skills and aspirations, 
                  while enabling companies to identify talent that aligns with their culture and requirements.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-10">
                  {stats.map((stat, index) => (
                    <motion.div 
                      key={index}
                      className="bg-white p-6 rounded-lg shadow-md text-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <h4 className="text-3xl font-bold text-blue-600">{stat.number}</h4>
                      <p className="text-gray-600 mt-2">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-gray-50 p-6 rounded-lg mt-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">Success Stories</h4>
                  <div className="space-y-4">
                    <blockquote className="italic text-gray-600 border-l-4 border-blue-500 pl-4">
                      After months of searching, your platform matched me with a position that perfectly aligns with my skills and career goals. I couldn&apost be happier with my new role.
                      <footer className="text-gray-500 mt-2 not-italic">— Jamie T., Software Engineer</footer>
                    </blockquote>
                    <blockquote className="italic text-gray-600 border-l-4 border-blue-500 pl-4">
                      The quality of candidates we&aposve found through your platform is exceptional. The AI matching has saved us countless hours in the hiring process.
                      <footer className="text-gray-500 mt-2 not-italic">— Sarah K., HR Director</footer>
                    </blockquote>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Team Section */}
        <motion.section 
          className="py-16 px-6 md:px-10 lg:px-20 bg-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div variants={fadeIn} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We&aposre a passionate group of technologists, data scientists, and industry experts committed to revolutionizing job search.
              </p>
            </motion.div>

            <motion.div variants={fadeIn} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div 
                  key={index}
                  className="bg-gray-50 rounded-lg overflow-hidden shadow-md"
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="p-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 text-center">{member.name}</h3>
                    <p className="text-blue-600 text-center mb-3">{member.role}</p>
                    <p className="text-gray-600 text-center">{member.bio}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Contact Section */}
        <section className="py-16 px-6 md:px-10 lg:px-20 bg-blue-900 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Connect With Us</h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Have questions about our platform? We&aposd love to hear from you.
              </p>
            </div>

            <div className="flex justify-center space-x-6 mb-12">
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="bg-white text-blue-900 p-3 rounded-full"
              >
                <Twitter size={24} />
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="bg-white text-blue-900 p-3 rounded-full"
              >
                <Linkedin size={24} />
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="bg-white text-blue-900 p-3 rounded-full"
              >
                <Github size={24} />
              </motion.a>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Contact Us</h3>
                <p className="mb-6 text-blue-100">
                  We&aposre always looking to improve our platform and would love to hear your feedback or answer any questions.
                </p>
                <div className="space-y-3">
                  <p><strong>Email:</strong> info@aijobportal.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Address:</strong> 123 Innovation Way, San Francisco, CA 94105</p>
                </div>
              </div>
              <div className="bg-blue-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Send Us a Message</h3>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full px-3 py-2 rounded text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-3 py-2 rounded text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                    <textarea 
                      id="message" 
                      rows="4" 
                      className="w-full px-3 py-2 rounded text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded transition-colors duration-300"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 md:px-10 lg:px-20 bg-gray-800 text-gray-300">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-white">AI Job Portal</h3>
              <p className="text-sm mt-1">Transforming the job search experience</p>
            </div>
            <div className="text-sm">
              &copy; {new Date().getFullYear()} AI Job Portal. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}