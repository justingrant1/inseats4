import { Helmet } from "react-helmet";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent } from "../components/ui/card";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | InSeats - Premium Ticket Marketplace</title>
        <meta 
          name="description" 
          content="Read InSeats' Privacy Policy. Learn how we collect, use, and protect your personal information on our platform." 
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
                  Privacy Policy
                </h1>
                <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed">
                  Your privacy is important to us. This policy explains how we handle your data.
                </p>
                <p className="text-sm text-zinc-400 mt-4">
                  Last updated: December 1, 2023
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Content */}
          <section className="py-24">
            <div className="container mx-auto container-padding">
              <div className="max-w-4xl mx-auto space-y-8">
                
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">1. Information We Collect</h2>
                    <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                    <p className="text-zinc-600 leading-relaxed mb-4">
                      We collect information you provide directly to us, such as when you create an account, make a purchase, 
                      or contact us for support. This may include:
                    </p>
                    <ul className="list-disc list-inside text-zinc-600 space-y-2 ml-4 mb-6">
                      <li>Name, email address, and phone number</li>
                      <li>Billing and shipping addresses</li>
                      <li>Payment information (processed securely through third-party providers)</li>
                      <li>Communication preferences</li>
                    </ul>
                    
                    <h3 className="text-lg font-semibold mb-3">Automatically Collected Information</h3>
                    <ul className="list-disc list-inside text-zinc-600 space-y-2 ml-4">
                      <li>Device information (IP address, browser type, operating system)</li>
                      <li>Usage data (pages visited, time spent, clickstream data)</li>
                      <li>Location information (if permitted by your device settings)</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">2. How We Use Your Information</h2>
                    <p className="text-zinc-600 leading-relaxed mb-4">
                      We use the information we collect to:
                    </p>
                    <ul className="list-disc list-inside text-zinc-600 space-y-2 ml-4">
                      <li>Provide, maintain, and improve our services</li>
                      <li>Process transactions and send related information</li>
                      <li>Send you technical notices, updates, security alerts, and support messages</li>
                      <li>Respond to your comments, questions, and requests</li>
                      <li>Communicate with you about products, services, offers, and events</li>
                      <li>Monitor and analyze trends, usage, and activities</li>
                      <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                      <li>Personalize your experience and provide recommendations</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">3. Information Sharing and Disclosure</h2>
                    <p className="text-zinc-600 leading-relaxed mb-4">
                      We may share your personal information in the following situations:
                    </p>
                    <h3 className="text-lg font-semibold mb-3">With Your Consent</h3>
                    <p className="text-zinc-600 leading-relaxed mb-4">
                      We may share your information with third parties when you give us consent to do so.
                    </p>
                    
                    <h3 className="text-lg font-semibold mb-3">Service Providers</h3>
                    <p className="text-zinc-600 leading-relaxed mb-4">
                      We may share your information with third-party service providers who perform services on our behalf, 
                      such as payment processing, data analysis, email delivery, and customer service.
                    </p>
                    
                    <h3 className="text-lg font-semibold mb-3">Legal Requirements</h3>
                    <p className="text-zinc-600 leading-relaxed mb-4">
                      We may disclose your information if required to do so by law or in response to valid requests by public authorities.
                    </p>
                    
                    <h3 className="text-lg font-semibold mb-3">Business Transfers</h3>
                    <p className="text-zinc-600 leading-relaxed">
                      If we are involved in a merger, acquisition, or asset sale, your personal information may be transferred.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">4. Data Security</h2>
                    <p className="text-zinc-600 leading-relaxed mb-4">
                      We implement appropriate technical and organizational security measures to protect your personal information against 
                      unauthorized or unlawful processing, accidental loss, destruction, or damage.
                    </p>
                    <ul className="list-disc list-inside text-zinc-600 space-y-2 ml-4">
                      <li>SSL encryption for data transmission</li>
                      <li>Secure data storage with access controls</li>
                      <li>Regular security audits and assessments</li>
                      <li>Employee training on data protection</li>
                      <li>Payment card industry (PCI) compliance</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">5. Cookies and Tracking Technologies</h2>
                    <p className="text-zinc-600 leading-relaxed mb-4">
                      We use cookies and similar tracking technologies to collect and use personal information about you. 
                      These technologies help us:
                    </p>
                    <ul className="list-disc list-inside text-zinc-600 space-y-2 ml-4 mb-4">
                      <li>Remember your preferences and settings</li>
                      <li>Understand how you use our website</li>
                      <li>Improve our services and user experience</li>
                      <li>Provide targeted advertising</li>
                    </ul>
                    <p className="text-zinc-600 leading-relaxed">
                      You can control cookies through your browser settings, but disabling cookies may affect the functionality of our service.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">6. Your Privacy Rights</h2>
                    <p className="text-zinc-600 leading-relaxed mb-4">
                      Depending on your location, you may have certain rights regarding your personal information:
                    </p>
                    <ul className="list-disc list-inside text-zinc-600 space-y-2 ml-4">
                      <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                      <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                      <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                      <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                      <li><strong>Objection:</strong> Object to certain processing of your information</li>
                      <li><strong>Restriction:</strong> Request restriction of processing under certain circumstances</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">7. Data Retention</h2>
                    <p className="text-zinc-600 leading-relaxed">
                      We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, 
                      unless a longer retention period is required or permitted by law. When we no longer need your personal information, 
                      we will securely delete or anonymize it.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">8. Children's Privacy</h2>
                    <p className="text-zinc-600 leading-relaxed">
                      Our service is not directed to children under the age of 13, and we do not knowingly collect personal information 
                      from children under 13. If we become aware that a child under 13 has provided us with personal information, 
                      we will take steps to delete such information.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">9. International Data Transfers</h2>
                    <p className="text-zinc-600 leading-relaxed">
                      Your information may be transferred to and processed in countries other than your country of residence. 
                      These countries may have data protection laws that are different from the laws of your country. 
                      We ensure that such transfers are made in accordance with applicable data protection laws.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">10. Changes to This Privacy Policy</h2>
                    <p className="text-zinc-600 leading-relaxed">
                      We may update this privacy policy from time to time. We will notify you of any changes by posting the new 
                      privacy policy on this page and updating the "Last updated" date. We encourage you to review this privacy 
                      policy periodically for any changes.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4 font-display">11. Contact Us</h2>
                    <p className="text-zinc-600 leading-relaxed mb-4">
                      If you have any questions about this privacy policy or our privacy practices, please contact us at:
                    </p>
                    <div className="text-zinc-600">
                      <p>Email: privacy@inseats.com</p>
                      <p>Phone: 1-800-INSEATS</p>
                      <p>Address: 123 Premium Ave, Suite 456, Los Angeles, CA 90210</p>
                    </div>
                    <p className="text-zinc-600 leading-relaxed mt-4">
                      For EU residents, you may also contact our Data Protection Officer at: dpo@inseats.com
                    </p>
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

export default PrivacyPolicy;
