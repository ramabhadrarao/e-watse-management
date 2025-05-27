import React from 'react';
import { Link } from 'react-router-dom';
import { 
  RecycleIcon, 
  Truck, 
  Building, 
  MapPin, 
  RefreshCw, 
  Shield, 
  Award, 
  CheckCircle,
  ChevronRight,
  ArrowRight,
  PhoneCall
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-500 to-green-600 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                E-Waste Management Made Simple
              </h1>
              <p className="text-green-100 text-xl mb-8 max-w-lg">
                Responsibly dispose of your electronic waste and help us create a cleaner, greener future.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/dashboard/request">
                  <Button variant="primary" size="lg" className="bg-white text-green-600 hover:bg-green-50">
                    <Truck className="mr-2 h-5 w-5" />
                    Request Pickup
                  </Button>
                </Link>
                <Link to="/services">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-green-600">
                    <MapPin className="mr-2 h-5 w-5" />
                    Drop-off Locations
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-64 h-64 bg-green-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="relative">
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl">
                    <RecycleIcon className="h-24 w-24 text-white mx-auto mb-6" />
                    <p className="text-white text-center text-lg font-medium">
                      Join our mission to reduce e-waste and protect our environment
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leading the way in responsible e-waste management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card variant="elevated" className="text-center transform transition-all duration-300 hover:-translate-y-2">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <RecycleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Eco-Friendly Disposal</h3>
              <p className="text-gray-600">
                We ensure proper recycling of all components using environmentally safe methods.
              </p>
            </Card>

            <Card variant="elevated" className="text-center transform transition-all duration-300 hover:-translate-y-2">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Data Destruction</h3>
              <p className="text-gray-600">
                Your data is completely wiped before processing with certified security protocols.
              </p>
            </Card>

            <Card variant="elevated" className="text-center transform transition-all duration-300 hover:-translate-y-2">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Certified Process</h3>
              <p className="text-gray-600">
                ISO-compliant and government-authorized facility with full transparency.
              </p>
            </Card>

            <Card variant="elevated" className="text-center transform transition-all duration-300 hover:-translate-y-2">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Free Pickup Available</h3>
              <p className="text-gray-600">
                Convenient doorstep e-waste collection at no additional cost.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive e-waste management solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card variant="elevated" className="p-8 flex flex-col h-full">
              <div className="flex items-center mb-6">
                <div className="bg-green-500 p-3 rounded-xl text-white mr-4">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Residential E-Waste Pickup</h3>
              </div>
              <p className="text-gray-600 mb-6 flex-grow">
                We collect old devices like phones, laptops, batteries, and chargers right from your doorstep with scheduled pickup times.
              </p>
              <Link to="/dashboard/request">
                <Button variant="outline" className="inline-flex items-center">
                  Schedule Pickup
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>

            <Card variant="elevated" className="p-8 flex flex-col h-full">
              <div className="flex items-center mb-6">
                <div className="bg-green-500 p-3 rounded-xl text-white mr-4">
                  <Building className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Corporate IT Asset Disposal</h3>
              </div>
              <p className="text-gray-600 mb-6 flex-grow">
                Secure and responsible recycling for organizations. Includes certified data wiping and compliance documentation.
              </p>
              <Link to="/contact">
                <Button variant="outline" className="inline-flex items-center">
                  Get Enterprise Quote
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>

            <Card variant="elevated" className="p-8 flex flex-col h-full">
              <div className="flex items-center mb-6">
                <div className="bg-green-500 p-3 rounded-xl text-white mr-4">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">E-Waste Drop-off Centers</h3>
              </div>
              <p className="text-gray-600 mb-6 flex-grow">
                Locate the nearest drop-off point and dispose of your devices responsibly at your convenience.
              </p>
              <Link to="/services">
                <Button variant="outline" className="inline-flex items-center">
                  Find Locations
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>

            <Card variant="elevated" className="p-8 flex flex-col h-full">
              <div className="flex items-center mb-6">
                <div className="bg-green-500 p-3 rounded-xl text-white mr-4">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Recycling & Reuse</h3>
              </div>
              <p className="text-gray-600 mb-6 flex-grow">
                Salvaging components to reduce landfill impact and support circular economy initiatives with maximum resource recovery.
              </p>
              <Link to="/about">
                <Button variant="outline" className="inline-flex items-center">
                  Learn More
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Impact So Far</h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Together, we're making a difference for our planet
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">22,400</div>
              <p className="text-green-100">kg of e-waste recycled</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">9,300</div>
              <p className="text-green-100">batteries safely processed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">15,000</div>
              <p className="text-green-100">users joined the mission</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <p className="text-green-100">customer satisfaction</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/register">
              <Button variant="primary" size="lg" className="bg-white text-green-600 hover:bg-green-50">
                Join the Movement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-12 md:p-12 md:flex md:items-center md:justify-between">
              <div className="md:w-0 md:flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Ready to dispose of your e-waste responsibly?
                </h2>
                <p className="mt-3 text-white text-opacity-90 max-w-lg">
                  Get in touch with us today to schedule a pickup or find your nearest drop-off location.
                </p>
              </div>
              <div className="mt-8 md:mt-0 md:ml-8 flex flex-col md:flex-row md:items-center justify-center md:justify-start space-y-4 md:space-y-0 md:space-x-4">
                <Link to="/dashboard/request">
                  <Button variant="primary" size="lg" className="bg-white text-blue-600 hover:bg-blue-50 w-full">
                    <Truck className="mr-2 h-5 w-5" />
                    Request Pickup
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-blue-600 w-full">
                    <PhoneCall className="mr-2 h-5 w-5" />
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;