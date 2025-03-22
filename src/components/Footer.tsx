
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-spotify-dark border-t border-spotify-gray/20 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-spotify flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-xl font-bold">Learnify</span>
            </Link>
            <p className="text-spotify-text/70 mb-6">
              Transforming education through technology. Learn at your own pace, anytime, anywhere.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-spotify-text/60 hover:text-spotify transition-colors duration-200">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-spotify-text/60 hover:text-spotify transition-colors duration-200">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-spotify-text/60 hover:text-spotify transition-colors duration-200">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-spotify-text/60 hover:text-spotify transition-colors duration-200">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-spotify-text/60 hover:text-spotify transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-spotify-text/60 hover:text-spotify transition-colors duration-200">
                  All Courses
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-spotify-text/60 hover:text-spotify transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-spotify-text/60 hover:text-spotify transition-colors duration-200">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-spotify-text/60 hover:text-spotify transition-colors duration-200">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Course Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/courses/development" className="text-spotify-text/60 hover:text-spotify transition-colors duration-200">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/courses/design" className="text-spotify-text/60 hover:text-spotify transition-colors duration-200">
                  UI/UX Design
                </Link>
              </li>
              <li>
                <Link to="/courses/marketing" className="text-spotify-text/60 hover:text-spotify transition-colors duration-200">
                  Digital Marketing
                </Link>
              </li>
              <li>
                <Link to="/courses/data-science" className="text-spotify-text/60 hover:text-spotify transition-colors duration-200">
                  Data Science
                </Link>
              </li>
              <li>
                <Link to="/courses/ai" className="text-spotify-text/60 hover:text-spotify transition-colors duration-200">
                  Artificial Intelligence
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="text-spotify shrink-0 mt-1" />
                <span className="text-spotify-text/70">123 Education Street, Learning City, 10001</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={20} className="text-spotify shrink-0" />
                <span className="text-spotify-text/70">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="text-spotify shrink-0" />
                <span className="text-spotify-text/70">info@learnify.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 mt-10 border-t border-spotify-gray/20 text-center text-spotify-text/60">
          <p>&copy; {currentYear} Learnify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
