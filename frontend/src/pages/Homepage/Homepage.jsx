import React from 'react';
import { 
  ArrowRight, 
  Heart, 
  Shield, 
  Users, 
  Calendar,
  CheckCircle,
  Star,
  Leaf,
  Brain,
  Activity,
  Clock,
  Award,
  Phone,
  Mail,
  MapPin,
  PlayCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const features = [
    {
      icon: Heart,
      title: "Personalized Dosha Assessment",
      description: "Discover your unique Ayurvedic constitution with our comprehensive dosha analysis."
    },
    {
      icon: Calendar,
      title: "Expert Consultations",
      description: "Connect with certified Ayurvedic practitioners for personalized treatment plans."
    },
    {
      icon: Shield,
      title: "Natural Healing",
      description: "Experience the power of traditional Ayurvedic remedies and holistic wellness."
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Join a community of wellness enthusiasts on their Ayurvedic journey."
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Complete Assessment",
      description: "Take our comprehensive dosha assessment to understand your unique constitution.",
      icon: Brain
    },
    {
      step: "02", 
      title: "Get Personalized Plan",
      description: "Receive a customized wellness plan based on your dosha and health goals.",
      icon: Activity
    },
    {
      step: "03",
      title: "Track Progress",
      description: "Monitor your wellness journey with our intuitive dashboard and progress tracking.",
      icon: CheckCircle
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer",
      content: "AyurSutra has transformed my approach to wellness. The personalized dosha assessment helped me understand my body better, and the expert guidance has been invaluable.",
      rating: 5,
      image: "/api/placeholder/64/64"
    },
    {
      name: "Rajesh Kumar",
      role: "Business Owner", 
      content: "The holistic approach and natural remedies have significantly improved my energy levels and overall health. Highly recommended!",
      rating: 5,
      image: "/api/placeholder/64/64"
    },
    {
      name: "Anita Patel",
      role: "Teacher",
      content: "The consultations with Ayurvedic experts are thorough and the treatment plans are easy to follow. I feel more balanced than ever.",
      rating: 5,
      image: "/api/placeholder/64/64"
    }
  ];

  const services = [
    {
      title: "Dosha Assessment",
      description: "Comprehensive evaluation of your Ayurvedic constitution",
      features: ["Detailed questionnaire", "Expert analysis", "Personalized report"],
      price: "Free",
      popular: false
    },
    {
      title: "Expert Consultation",
      description: "One-on-one sessions with certified Ayurvedic practitioners",
      features: ["60-minute consultation", "Personalized treatment plan", "Follow-up support"],
      price: "₹2,999",
      popular: true
    },
    {
      title: "Wellness Program",
      description: "Complete 3-month holistic wellness journey",
      features: ["Monthly consultations", "Custom meal plans", "Yoga & meditation guidance", "24/7 support"],
      price: "₹9,999",
      popular: false
    }
  ];

  const stats = [
    { number: "10,000+", label: "Happy Patients" },
    { number: "50+", label: "Expert Practitioners" },
    { number: "15+", label: "Years Experience" },
    { number: "98%", label: "Success Rate" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">AyurSutra</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">Features</a>
              <a href="#services" className="text-gray-600 hover:text-green-600 transition-colors">Services</a>
              <a href="#testimonials" className="text-gray-600 hover:text-green-600 transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-600 hover:text-green-600 transition-colors">Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/login" 
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your Journey to 
                <span className="text-green-600 block">Holistic Wellness</span>
                Starts Here
              </h1>
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                Discover the ancient wisdom of Ayurveda with modern technology. Get personalized wellness plans, expert consultations, and track your progress on your path to optimal health.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link 
                  to="login"
                  className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  Start Your Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <button className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center mt-8 space-x-8">
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-green-100 border-2 border-white"></div>
                    ))}
                  </div>
                  <span className="ml-3 text-gray-600">10,000+ users trust us</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Your Dosha Balance</h3>
                    <span className="text-green-600 text-sm font-medium">85% Complete</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Vata</span>
                      <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full w-1/3"></div>
                      </div>
                      <span className="text-sm font-medium">33%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pitta</span>
                      <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full w-2/5"></div>
                      </div>
                      <span className="text-sm font-medium">40%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Kapha</span>
                      <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-1/4"></div>
                      </div>
                      <span className="text-sm font-medium">27%</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Primary Dosha:</strong> Pitta - You have a strong digestive fire and natural leadership qualities.
                    </p>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg">
                <Heart className="h-6 w-6 text-red-500" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg">
                <Leaf className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-green-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose AyurSutra Wellness?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the perfect blend of ancient Ayurvedic wisdom and modern technology for your wellness journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-green-100 rounded-lg p-3 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Your wellness journey simplified in three easy steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <div className="bg-green-100 rounded-lg p-3 w-fit mx-auto mb-4">
                    <step.icon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <ArrowRight className="h-6 w-6 text-green-600 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600">
              Choose the perfect plan for your wellness journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className={`bg-white rounded-xl p-8 shadow-lg relative ${service.popular ? 'ring-2 ring-green-500' : ''}`}>
                {service.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="text-4xl font-bold text-green-600">{service.price}</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  service.popular 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'border-2 border-green-600 text-green-600 hover:bg-green-50'
                }`}>
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Patients Say
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from real people on their wellness journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of others who have discovered the power of personalized Ayurvedic wellness. Start your free assessment today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/auth/register"
              className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Schedule Consultation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Leaf className="h-8 w-8 text-green-400" />
                <span className="ml-2 text-2xl font-bold">AyurSutra</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering your wellness journey through ancient Ayurvedic wisdom and modern technology.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Dosha Assessment</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Expert Consultations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Wellness Programs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ayurvedic Treatments</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3" />
                  <span>hello@ayursutra.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>Mumbai, Maharashtra, India</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AyurSutra Wellness. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;