import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Loyal Customer",
    content: "The shopping experience was seamless from browsing to checkout. The products are high-quality and arrived earlier than expected. Will definitely shop here again!",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/women/12.jpg"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Repeat Customer",
    content: "I love the quality of the products and the customer service is exceptional. When I had an issue with my order, the support team resolved it immediately. Highly recommended!",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "New Customer",
    content: "The website is easy to navigate, and the product descriptions are accurate. I've purchased multiple items and have been satisfied with every order. The shipping is fast and reliable.",
    rating: 4.5,
    avatar: "https://randomuser.me/api/portraits/women/68.jpg"
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-2 text-center">What Our Customers Say</h2>
        <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          Hear from our satisfied customers about their shopping experience with ShopEase.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => {
                  // For half star
                  if (i === Math.floor(testimonial.rating) && testimonial.rating % 1 !== 0) {
                    return (
                      <div key={i} className="relative">
                        <Star className="h-5 w-5 text-gray-300" />
                        <div className="absolute inset-0 overflow-hidden w-1/2">
                          <Star className="h-5 w-5 fill-current" />
                        </div>
                      </div>
                    );
                  }
                  return (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < testimonial.rating ? "fill-current" : "text-gray-300"}`}
                    />
                  );
                })}
              </div>
              
              <p className="text-gray-700 mb-6 italic">{testimonial.content}</p>
              
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={`${testimonial.name} avatar`} 
                  className="w-10 h-10 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
