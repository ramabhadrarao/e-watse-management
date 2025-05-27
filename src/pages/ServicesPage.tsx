import React from 'react';
import { Truck, Building, MapPin, Shield, Recycle, FileCheck } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ServicesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600">Comprehensive e-waste management solutions for everyone</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card variant="elevated" className="p-8">
            <div className="flex items-start">
              <div className="bg-green-100 p-4 rounded-lg">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold mb-3">Residential Pickup</h3>
                <p className="text-gray-600 mb-4">
                  Convenient doorstep collection of e-waste from homes. Free pickup
                  available for 5 or more items.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-600">
                    <span className="bg-green-100 p-1 rounded-full mr-2">✓</span>
                    Scheduled pickup times
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="bg-green-100 p-1 rounded-full mr-2">✓</span>
                    Professional handling
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="bg-green-100 p-1 rounded-full mr-2">✓</span>
                    Instant price estimation
                  </li>
                </ul>
                <Button variant="primary">Schedule Pickup</Button>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-8">
            <div className="flex items-start">
              <div className="bg-green-100 p-4 rounded-lg">
                <Building className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold mb-3">Corporate IT Asset Disposal</h3>
                <p className="text-gray-600 mb-4">
                  Secure and compliant disposal of corporate IT assets with detailed
                  reporting and certification.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-600">
                    <span className="bg-green-100 p-1 rounded-full mr-2">✓</span>
                    Bulk collection
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="bg-green-100 p-1 rounded-full mr-2">✓</span>
                    Data destruction certificates
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="bg-green-100 p-1 rounded-full mr-2">✓</span>
                    Asset tracking
                  </li>
                </ul>
                <Button variant="primary">Get Enterprise Quote</Button>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-8">
            <div className="flex items-start">
              <div className="bg-green-100 p-4 rounded-lg">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold mb-3">Drop-off Centers</h3>
                <p className="text-gray-600 mb-4">
                  Conveniently located collection points for easy disposal of your
                  electronic waste.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-600">
                    <span className="bg-green-100 p-1 rounded-full mr-2">✓</span>
                    Multiple locations
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="bg-green-100 p-1 rounded-full mr-2">✓</span>
                    Flexible timing
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="bg-green-100 p-1 rounded-full mr-2">✓</span>
                    No minimum quantity
                  </li>
                </ul>
                <Button variant="primary">Find Locations</Button>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-8">
            <div className="flex items-start">
              <div className="bg-green-100 p-4 rounded-lg">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold mb-3">Data Security</h3>
                <p className="text-gray-600 mb-4">
                  Professional data destruction services with certified processes and
                  documentation.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-600">
                    <span className="bg-green-100 p-1 rounded-full mr-2">✓</span>
                    Secure wiping
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="bg-green-100 p-1 rounded-full mr-2">✓</span>
                    Physical destruction
                  </li>
                  <li className="flex items-center text-gray-600">
                    <span className="bg-green-100 p-1 rounded-full mr-2">✓</span>
                    Verification reports
                  </li>
                </ul>
                <Button variant="primary">Learn More</Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card variant="elevated" className="p-8">
            <h3 className="text-xl font-bold mb-4">Recycling Process</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Recycle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold mb-1">Collection & Sorting</h4>
                  <p className="text-gray-600">
                    Professional collection and categorization of e-waste items
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold mb-1">Data Security</h4>
                  <p className="text-gray-600">
                    Secure data destruction and drive wiping
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FileCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold mb-1">Processing & Recovery</h4>
                  <p className="text-gray-600">
                    Eco-friendly processing and material recovery
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="p-8">
            <h3 className="text-xl font-bold mb-4">Service Coverage</h3>
            <p className="text-gray-600 mb-4">
              We currently serve the following areas with our pickup service:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-gray-600">
                <span className="bg-green-100 p-1 rounded-full mr-2">✓</span>
                Mumbai Metropolitan Region
              </li>
              <li className="flex items-center text-gray-600">
                <span className="bg-green-100 p-1 rounded-full mr-2">✓</span>
                Pune City and Suburbs
              </li>
              <li className="flex items-center text-gray-600">
                <span className="bg-green-100 p-1 rounded-full mr-2">✓</span>
                Navi Mumbai
              </li>
              <li className="flex items-center text-gray-600">
                <span className="bg-green-100 p-1 rounded-full mr-2">✓</span>
                Thane District
              </li>
            </ul>
            <Button variant="outline">Check Your Area</Button>
          </Card>
        </div>

        <Card variant="elevated" className="p-8 bg-green-600 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Dispose of Your E-Waste?</h2>
            <p className="text-xl mb-6">
              Schedule a pickup or find your nearest drop-off location today.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="primary" className="bg-white text-green-600 hover:bg-green-50">
                Schedule Pickup
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-green-500">
                Find Drop-off Location
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ServicesPage;