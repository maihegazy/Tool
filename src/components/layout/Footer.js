import React from 'react';
import { 
  Heart, 
  Coffee, 
  Github, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  Clock,
  Shield,
  HelpCircle,
  FileText,
  Users,
  BarChart3
} from 'lucide-react';

const Footer = ({ 
  variant = 'full', // 'full', 'minimal', 'compact'
  showStats = true,
  showQuickLinks = true,
  showContactInfo = true,
  showCompanyInfo = true,
  customContent = null
}) => {
  const currentYear = new Date().getFullYear();

  // Quick links configuration
  const quickLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { label: 'RFQs', href: '/rfqs', icon: FileText },
    { label: 'Resources', href: '/resources', icon: Users },
    { label: 'Help Center', href: '/help', icon: HelpCircle },
    { label: 'Privacy Policy', href: '/privacy', icon: Shield },
    { label: 'Terms of Service', href: '/terms', icon: FileText }
  ];

  const contactInfo = [
    { label: 'support@company.com', href: 'mailto:support@company.com', icon: Mail },
    { label: '+1 (555) 123-4567', href: 'tel:+15551234567', icon: Phone },
    { label: '123 Business St, City, State 12345', href: '#', icon: MapPin }
  ];

  const socialLinks = [
    { label: 'GitHub', href: 'https://github.com', icon: Github },
    { label: 'Email', href: 'mailto:contact@company.com', icon: Mail }
  ];

  // Minimal footer variant
  if (variant === 'minimal') {
    return (
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center">
              <span>© {currentYear} RFQ Planning Tool. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                Made with <Heart size={14} className="text-red-500 mx-1" /> by the Dev Team
              </span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Compact footer variant
  if (variant === 'compact') {
    return (
      <footer className="bg-gray-50 border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>© {currentYear} RFQ Planning Tool</span>
              <a href="/privacy" className="hover:text-blue-600">Privacy</a>
              <a href="/terms" className="hover:text-blue-600">Terms</a>
              <a href="/help" className="hover:text-blue-600">Help</a>
            </div>
            <div className="flex items-center space-x-4">
              {socialLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  target={link.href.startsWith('http') ? '_blank' : '_self'}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : ''}
                >
                  <link.icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Full footer variant (default)
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          {showCompanyInfo && (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">RFQ Planning</h3>
                  <p className="text-xs text-gray-500">Resource Management</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Streamline your RFQ process with our comprehensive resource planning and management platform.
              </p>
              <div className="flex items-center space-x-4">
                {socialLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    target={link.href.startsWith('http') ? '_blank' : '_self'}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : ''}
                  >
                    <link.icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Quick Links */}
          {showQuickLinks && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <link.icon size={14} className="mr-2" />
                      {link.label}
                      {link.href.startsWith('http') && (
                        <ExternalLink size={12} className="ml-1" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Information */}
          {showContactInfo && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Contact Us</h4>
              <ul className="space-y-3">
                {contactInfo.map(contact => (
                  <li key={contact.label}>
                    <a
                      href={contact.href}
                      className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <contact.icon size={14} className="mr-2" />
                      {contact.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center text-sm text-blue-800">
                  <Clock size={14} className="mr-2" />
                  <span className="font-medium">Support Hours</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Monday - Friday: 9:00 AM - 6:00 PM EST
                </p>
              </div>
            </div>
          )}

          {/* System Status & Stats */}
          {showStats && (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-4">System Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">System Status</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-green-600 font-medium">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-xs text-gray-500">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Version</span>
                  <span className="text-xs text-gray-500">v2.1.0</span>
                </div>
              </div>

              {/* Custom content area */}
              {customContent && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  {customContent}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="flex items-center text-sm text-gray-500">
              <span>© {currentYear} RFQ Planning Tool. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <a href="/privacy" className="hover:text-blue-600 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-blue-600 transition-colors">
                Terms of Service
              </a>
              <span className="flex items-center">
                Made with <Heart size={14} className="text-red-500 mx-1" /> and{' '}
                <Coffee size={14} className="text-brown-500 ml-1" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;