import React from 'react';
import Header from '@/components/Header';
import { SiDiscord } from 'react-icons/si';

const ContactPage: React.FC = () => {
  // Empty search handler (required by Header component)
  const handleSearch = (query: string) => {
    console.log("Search not available in Contact page");
  };

  return (
    <div className="bg-dark text-white min-h-screen">
      <Header onSearch={handleSearch} />
      
      <main className="container mx-auto px-4 py-12">
        <section className="max-w-3xl mx-auto bg-gray-900 rounded-lg p-8 shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-primary">Contact Us</h2>
          
          <div className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <SiDiscord className="text-primary mr-2 text-2xl" />
                <span>Join Our Discord Community</span>
              </h3>
              <p className="mb-4">Engage with the community, suggest stuff and have fun!</p>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-400">Discord Server:</span> 
                  <a 
                    href="https://discord.gg/4xH59bXENn" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline ml-2"
                  >
                    https://discord.gg/4xH59bXENn
                  </a>
                </p>
                <p>
                  <span className="text-gray-400">Discord Username:</span> 
                  <span className="text-primary ml-2">@lingonjr</span>
                </p>
              </div>
              <div className="mt-6">
                <a 
                  href="https://discord.gg/4xH59bXENn" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block bg-primary hover:bg-primary/80 text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                  Join Discord Server
                </a>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">About Thrillz Flix</h3>
              <p className="text-gray-300">
                Thrillz Flix offers free movie and TV show streaming with no ads or subscriptions. 
                Our platform is constantly updating with the latest releases and classic titles.
                <br/>
                <br/>
                If you have any suggestions feel free to contact me through Discord.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactPage;