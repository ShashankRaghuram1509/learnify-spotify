
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Info, BookOpen, Award, Users, School, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        {/* Header */}
        <section className="bg-spotify-dark py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#1DB95420,_transparent_50%)]"></div>
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
                About Learnify
              </h1>
              <p className="text-xl text-spotify-text/80 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Your trusted resource for high-quality educational content
              </p>
            </div>
          </div>
        </section>
        
        {/* Our Mission */}
        <section className="py-16 bg-spotify-dark">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-spotify-text/80 text-lg">
                At Learnify, we're dedicated to making high-quality education accessible to everyone. 
                Our platform is designed to help learners at all levels master essential skills in 
                computer science, programming, and technology through carefully curated courses 
                and resources.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-spotify-gray/20 p-8 rounded-xl border border-spotify-gray/30 text-center">
                <div className="w-16 h-16 bg-spotify/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-spotify" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Quality Content</h3>
                <p className="text-spotify-text/70">
                  All our courses are created by industry experts and carefully reviewed to ensure accuracy and relevance.
                </p>
              </div>
              
              <div className="bg-spotify-gray/20 p-8 rounded-xl border border-spotify-gray/30 text-center">
                <div className="w-16 h-16 bg-spotify/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-spotify" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Community Learning</h3>
                <p className="text-spotify-text/70">
                  Join our community of learners where you can collaborate, share insights, and grow together.
                </p>
              </div>
              
              <div className="bg-spotify-gray/20 p-8 rounded-xl border border-spotify-gray/30 text-center">
                <div className="w-16 h-16 bg-spotify/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-spotify" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Recognized Expertise</h3>
                <p className="text-spotify-text/70">
                  Our certificates are recognized in the industry and can help advance your career.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Story */}
        <section className="py-16 bg-spotify-gray/10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <p className="text-spotify-text/80 mb-6">
                  Founded in 2022, Learnify began with a simple idea: to create a learning platform that combines the depth of academic education with the practical relevance needed in today's tech industry.
                </p>
                <p className="text-spotify-text/80 mb-6">
                  Taking inspiration from platforms like GeeksForGeeks, we've built a comprehensive resource hub that provides both free and premium content to cater to different learning needs and stages.
                </p>
                <p className="text-spotify-text/80">
                  Today, we serve thousands of learners worldwide, offering courses in programming, data structures, algorithms, web development, and many other areas of computer science and technology.
                </p>
              </div>
              <div className="md:w-1/2 grid grid-cols-2 gap-4">
                <div className="bg-spotify-gray/20 p-6 rounded-xl border border-spotify-gray/30">
                  <div className="text-3xl font-bold text-spotify mb-2">10K+</div>
                  <div className="text-spotify-text/70">Active Students</div>
                </div>
                <div className="bg-spotify-gray/20 p-6 rounded-xl border border-spotify-gray/30">
                  <div className="text-3xl font-bold text-spotify mb-2">200+</div>
                  <div className="text-spotify-text/70">Free Tutorials</div>
                </div>
                <div className="bg-spotify-gray/20 p-6 rounded-xl border border-spotify-gray/30">
                  <div className="text-3xl font-bold text-spotify mb-2">50+</div>
                  <div className="text-spotify-text/70">Premium Courses</div>
                </div>
                <div className="bg-spotify-gray/20 p-6 rounded-xl border border-spotify-gray/30">
                  <div className="text-3xl font-bold text-spotify mb-2">15+</div>
                  <div className="text-spotify-text/70">Expert Instructors</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Team */}
        <section className="py-16 bg-spotify-dark">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Meet Our Team</h2>
              <p className="text-spotify-text/80 text-lg max-w-3xl mx-auto">
                Our team of dedicated educators and industry professionals work tirelessly to create
                and curate the best educational content for our community.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: "Dr. Sarah Johnson",
                  role: "Founder & Lead Instructor",
                  bio: "Ph.D. in Computer Science with 15 years of industry experience",
                  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80"
                },
                {
                  name: "Michael Chen",
                  role: "Data Science Lead",
                  bio: "Former senior data scientist at Google with extensive teaching experience",
                  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                },
                {
                  name: "Priya Sharma",
                  role: "Web Development Expert",
                  bio: "Full-stack developer with expertise in modern JavaScript frameworks",
                  image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80"
                },
                {
                  name: "James Wilson",
                  role: "Algorithms Specialist",
                  bio: "Competitive programmer and coach with multiple international awards",
                  image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80"
                }
              ].map((member, index) => (
                <div key={index} className="bg-spotify-gray/20 rounded-xl border border-spotify-gray/30 overflow-hidden">
                  <div className="aspect-square">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-spotify mb-3">{member.role}</p>
                    <p className="text-spotify-text/70">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
