
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 bg-spotify-dark">
        <section className="py-16 min-h-[80vh] flex items-center">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="hidden lg:block">
                <div className="p-8 rounded-2xl bg-spotify-gray/20 backdrop-blur-lg border border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#1DB95420,_transparent_50%)]"></div>
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-6">Join Learnify Today</h2>
                    <p className="text-spotify-text/80 text-lg mb-6">
                      Create your account to unlock a world of knowledge and skills. Start your learning journey with our expert-led courses.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="bg-spotify/10 p-2 rounded-full mr-4 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-spotify">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Join a global community</h3>
                          <p className="text-spotify-text/70">Connect with students and instructors from around the world</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-spotify/10 p-2 rounded-full mr-4 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-spotify">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Access to all courses</h3>
                          <p className="text-spotify-text/70">Browse and enroll in any of our 200+ professional courses</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-spotify/10 p-2 rounded-full mr-4 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-spotify">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Personalized experience</h3>
                          <p className="text-spotify-text/70">Get course recommendations based on your interests and goals</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <AuthForm type="register" />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;
