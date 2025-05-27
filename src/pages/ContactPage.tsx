import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';

const ContactPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">Get in touch with our team for any queries or support</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card variant="elevated" className="p-6">
            <div className="flex items-start">
              <div className="bg-green-100 p-3 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-lg mb-2">Visit Us</h3>
                <p className="text-gray-600">
                  Swarnandhra Campus<br />
                  Narsapur, India
                </p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-6">
            <div className="flex items-start">
              <div className="bg-green-100 p-3 rounded-lg">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-lg mb-2">Call Us</h3>
                <p className="text-gray-600">
                  +91-98765-43210<br />
                  Monday to Saturday, 9am to 6pm
                </p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-6">
            <div className="flex items-start">
              <div className="bg-green-100 p-3 rounded-lg">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-lg mb-2">Email Us</h3>
                <p className="text-gray-600">
                  contact@computercare.org<br />
                  support@computercare.org
                </p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-6">
            <div className="flex items-start">
              <div className="bg-green-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-bold text-lg mb-2">Working Hours</h3>
                <p className="text-gray-600">
                  Monday - Saturday: 9:00 AM - 6:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card variant="elevated" className="p-8">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="Your full name"
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <Input
                  label="Subject"
                  type="text"
                  placeholder="How can we help?"
                  className="mb-4"
                  required
                />
                <TextArea
                  label="Message"
                  placeholder="Your message..."
                  rows={5}
                  className="mb-6"
                  required
                />
                <Button type="submit" variant="primary">
                  Send Message
                </Button>
              </form>
            </Card>
          </div>

          <div>
            <Card variant="elevated" className="p-8">
              <h2 className="text-2xl font-bold mb-6">FAQ</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-2">What items do you accept?</h3>
                  <p className="text-gray-600">
                    We accept all types of electronic waste including computers, laptops,
                    mobile phones, tablets, printers, and more.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Is pickup service free?</h3>
                  <p className="text-gray-600">
                    Yes, pickup service is free for orders with 5 or more items.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">How is data handled?</h3>
                  <p className="text-gray-600">
                    We follow strict data destruction protocols and provide certificates
                    upon request.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;