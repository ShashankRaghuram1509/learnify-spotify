
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MapPin, Phone, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll get back to you soon!",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    }, 1500);
  };

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
                Get In Touch
              </h1>
              <p className="text-xl text-spotify-text/80 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Have a question or feedback? We'd love to hear from you.
              </p>
            </div>
          </div>
        </section>
        
        {/* Contact Form & Info */}
        <section className="py-16 bg-spotify-dark">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Information */}
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-spotify shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Our Address</h3>
                      <p className="text-spotify-text/70">
                        123 Learning Street<br />
                        Tech Valley, CA 94043<br />
                        United States
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-spotify shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Email Us</h3>
                      <p className="text-spotify-text/70">
                        info@learnify.com<br />
                        support@learnify.com
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-spotify shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium mb-1">Call Us</h3>
                      <p className="text-spotify-text/70">
                        +1 (555) 123-4567<br />
                        +1 (555) 987-6543
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-spotify-gray/30">
                  <h3 className="font-medium mb-4">Office Hours</h3>
                  <div className="space-y-2 text-spotify-text/70">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block mb-2 text-sm font-medium">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-spotify-gray/20 border border-spotify-gray/30 rounded-lg 
                                 focus:ring-2 focus:ring-spotify/50 focus:border-transparent focus:outline-none
                                 text-spotify-text placeholder:text-spotify-text/50"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium">
                        Your Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-spotify-gray/20 border border-spotify-gray/30 rounded-lg 
                                 focus:ring-2 focus:ring-spotify/50 focus:border-transparent focus:outline-none
                                 text-spotify-text placeholder:text-spotify-text/50"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block mb-2 text-sm font-medium">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full p-3 bg-spotify-gray/20 border border-spotify-gray/30 rounded-lg 
                               focus:ring-2 focus:ring-spotify/50 focus:border-transparent focus:outline-none
                               text-spotify-text placeholder:text-spotify-text/50"
                      placeholder="How can we help you?"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block mb-2 text-sm font-medium">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full p-3 bg-spotify-gray/20 border border-spotify-gray/30 rounded-lg 
                               focus:ring-2 focus:ring-spotify/50 focus:border-transparent focus:outline-none
                               text-spotify-text placeholder:text-spotify-text/50"
                      placeholder="Write your message here..."
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="spotify-button flex items-center justify-center space-x-2 py-3 px-6 min-w-[150px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
        
        {/* Map Section */}
        <section className="py-16 bg-spotify-gray/10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Find Us</h2>
              <p className="text-spotify-text/80 text-lg max-w-3xl mx-auto">
                Visit our campus to experience Learnify in person and meet our team of educators.
              </p>
            </div>
            
            <div className="bg-spotify-gray/20 border border-spotify-gray/30 rounded-xl overflow-hidden h-[400px] relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-center text-spotify-text/70">
                  Map loading... <br />
                  <span className="text-sm">(Static map placeholder - would show an interactive map in production)</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
