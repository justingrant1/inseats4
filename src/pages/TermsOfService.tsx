import { Helmet } from "react-helmet";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent } from "../components/ui/card";

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | InSeats - Premium Ticket Marketplace</title>
        <meta 
          name="description" 
          content="Read InSeats' Terms of Service. Understand the rules and regulations for using our premium ticket marketplace platform." 
        />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-zinc-900 to-black text-white py-24">
            <div className="container mx-auto container-padding">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display">
                  Terms of Service
                </h1>
                <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed">
                  Please read these terms carefully before using InSeats
                </p>
                <p className="text-sm text-zinc-400 mt-4">
                  Last updated: December 1, 2023
                </p>
              </div>
            </div>
          </section>

          {/* Terms Content */}
          <section className="py-24">
            <div className="container mx-auto container-padding">
              <div className="max-w-4xl mx-auto space-y-8">
                
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">1. Acceptance of Terms</h2>
                    <p className="text-zinc-600 leading-relaxed mb-4">
                      By accessing and using InSeats ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                      If you do not agree to abide by the above, please do not use this service.
                    </p>
                    <p className="text-zinc-600 leading-relaxed">
                      These Terms of Service apply to all users of the site, including without limitation users who are browsers, 
                      vendors, customers, merchants, and contributors of content.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">2. Use License</h2>
                    <p className="text-zinc-600 leading-relaxed mb-4">
                      Permission is granted to temporarily download one copy of InSeats materials for personal, non-commercial transitory viewing only. 
                      This is the grant of a license, not a transfer of title, and under this license you may not:
                    </p>
                    <ul className="list-disc list-inside text-zinc-600 space-y-2 ml-4">
                      <li>modify or copy the materials</li>
                      <li>use the materials for any commercial purpose or for any public display</li>
                      <li>attempt to reverse engineer any software contained on InSeats' website</li>
                      <li>remove any copyright or other proprietary notations from the materials</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">3. Ticket Purchases and Sales</h2>
                    <h3 className="text-lg font-semibold mb-3">Buying Tickets</h3>
                    <ul className="list-disc list-inside text-zinc-600 space-y-2 ml-4 mb-4">
                      <li>All ticket sales are final unless the event is cancelled</li>
                      <li>Prices are set by individual sellers and may exceed face value</li>
                      <li>InSeats guarantees the authenticity of all tickets sold through our platform</li>
                      <li>You are responsible for checking event details, dates, and venue information</li>
                    </ul>
                    
                    <h3 className="text-lg font-semibold mb-3">Selling Tickets</h3>
                    <ul className="list-disc list-inside text-zinc-600 space-y-2 ml-4">
                      <li>You must own the tickets you are selling</li>
                      <li>All tickets must be authentic and valid</li>
                      <li>You are responsible for transferring tickets to buyers upon payment</li>
                      <li>InSeats charges a service fee for each successful sale</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">4. User Accounts</h2>
                    <p className="text-zinc-600 leading-relaxed mb-4">
                      When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
                      You are responsible for safeguarding the password and for all activities that occur under your account.
                    </p>
                    <p className="text-zinc-600 leading-relaxed">
                      You may not use another user's account without permission. You must notify us immediately upon becoming aware of any breach 
                      of security or unauthorized use of your account.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">5. Prohibited Uses</h2>
                    <p className="text-zinc-600 leading-relaxed mb-4">
                      You may not use our service:
                    </p>
                    <ul className="list-disc list-inside text-zinc-600 space-y-2 ml-4">
                      <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                      <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                      <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                      <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                      <li>To submit false or misleading information</li>
                      <li>To upload or transmit viruses or any other type of malicious code</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">6. Disclaimers</h2>
                    <p className="text-zinc-600 leading-relaxed mb-4">
                      The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, 
                      InSeats excludes all representations, warranties, conditions and terms.
                    </p>
                    <p className="text-zinc-600 leading-relaxed">
                      InSeats shall not be liable for any loss or damage that may arise directly or indirectly from use of or 
                      reliance on information contained within this website.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">7. Limitations</h2>
                    <p className="text-zinc-600 leading-relaxed">
                      InSeats or its suppliers will not be held accountable for any damages that will arise with the use or inability to use 
                      the materials on InSeats' website, even if InSeats or an authorized representative of this website has been notified, 
                      orally or written, of the possibility of such damage. Some jurisdictions do not allow limitations on implied warranties 
                      or limitations of liability for incidental damages, these limitations may not apply to you.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">8. Refund and Return Policy</h2>
                    <p className="text-zinc-600 leading-relaxed mb-4">
                      All ticket sales are final. Refunds are only provided in the following circumstances:
                    </p>
                    <ul className="list-disc list-inside text-zinc-600 space-y-2 ml-4">
                      <li>Event is cancelled and not rescheduled</li>
                      <li>Event is postponed and you cannot attend the new date</li>
                      <li>Tickets are found to be invalid or counterfeit (subject to investigation)</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">9. Changes to Terms</h2>
                    <p className="text-zinc-600 leading-relaxed">
                      InSeats reserves the right to revise these terms of service at any time without notice. 
                      By using this website, you are agreeing to be bound by the current version of these Terms of Service.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">10. Contact Information</h2>
                    <p className="text-zinc-600 leading-relaxed">
                      If you have any questions about these Terms of Service, please contact us at:
                    </p>
                    <div className="mt-4 text-zinc-600">
                      <p>Email: sales@inseats.com</p>
                      <p>Phone: 917-698-0202</p>
                      <p>Address: 123 Premium Ave, Suite 456, Los Angeles, CA 90210</p>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default TermsOfService;
