import React from 'react';
import { Award, Shield, Leaf, Clock } from 'lucide-react';
import Card from '../components/ui/Card';

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About ComputerCare</h1>
          <p className="text-xl text-gray-600">Leading the way in responsible e-waste management</p>
        </div>

        <div className="prose prose-lg max-w-none mb-12">
          <p className="lead mb-8">
            ComputerCare has been at the forefront of IT asset management and sustainability
            since our inception. Our mission is to make e-waste recycling accessible,
            secure, and environmentally impactful.
          </p>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
            <h3 className="text-green-800 font-bold mb-2">Our Mission</h3>
            <p className="text-green-700 mb-0">
              To create a sustainable future by providing accessible and secure e-waste
              management solutions while ensuring environmental protection and data security.
            </p>
          </div>

          <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card variant="elevated" className="p-6">
              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-lg mb-2">Secure Data Handling</h3>
                  <p className="text-gray-600">
                    Military-grade data destruction ensuring your sensitive information
                    remains protected throughout the disposal process.
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="p-6">
              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-lg mb-2">Certified Process</h3>
                  <p className="text-gray-600">
                    ISO-certified facilities and government-authorized processes ensuring
                    compliance with environmental regulations.
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="p-6">
              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-lg mb-2">Eco-Friendly</h3>
                  <p className="text-gray-600">
                    Zero landfill policy with maximum resource recovery and minimal
                    environmental impact.
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
                  <h3 className="font-bold text-lg mb-2">Convenient Service</h3>
                  <p className="text-gray-600">
                    Free pickup service with flexible scheduling and real-time tracking
                    of your e-waste disposal.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mb-4">Our Process</h2>
          <div className="space-y-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <h4 className="font-bold">Collection</h4>
                <p>Schedule a pickup or drop off your e-waste at our collection centers</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <h4 className="font-bold">Data Security</h4>
                <p>Secure data wiping and destruction of storage devices</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <h4 className="font-bold">Sorting & Dismantling</h4>
                <p>Careful segregation of components for maximum recovery</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">4</div>
              <div>
                <h4 className="font-bold">Recycling</h4>
                <p>Eco-friendly processing and resource recovery</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4">Our Commitment</h2>
          <p>
            At ComputerCare, we're committed to providing transparent, efficient, and
            environmentally responsible e-waste management solutions. Our team of experts
            ensures that every device is handled with care, every component is recycled
            properly, and every client receives the highest level of service.
          </p>
        </div>

        <div className="bg-green-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Dispose of Your E-Waste?</h2>
          <p className="text-xl mb-6">Join us in creating a sustainable future for our planet.</p>
          <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-green-50 transition-colors">
            Schedule a Pickup
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;