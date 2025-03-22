
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";

const Login = () => {
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
                    <h2 className="text-3xl font-bold mb-6">Welcome Back to Learnify</h2>
                    <p className="text-spotify-text/80 text-lg mb-6">
                      Sign in to continue your learning journey and access your courses, track your progress, and connect with other students.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="bg-spotify/10 p-2 rounded-full mr-4 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-spotify">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Connect with instructors</h3>
                          <p className="text-spotify-text/70">Get direct answers and insights from industry experts</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-spotify/10 p-2 rounded-full mr-4 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-spotify">
                            <path d="M12 20h9"/>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Track your progress</h3>
                          <p className="text-spotify-text/70">Resume where you left off and monitor your achievements</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-spotify/10 p-2 rounded-full mr-4 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-spotify">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Lifetime access</h3>
                          <p className="text-spotify-text/70">Learn at your own pace with unlimited access to course materials</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <AuthForm type="login" />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
