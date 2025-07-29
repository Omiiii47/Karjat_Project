'use client';

import { useState } from 'react';

export default function TestContactPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testSubmitContact = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('Testing contact form submission...');
      
      const testData = {
        name: 'Test User ' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        subject: 'Test Subject',
        message: 'This is a test message to verify the contact form is working properly.'
      };

      console.log('Sending data:', testData);

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setResult(`✅ SUCCESS: Contact saved with ID: ${data.contactId}`);
      } else {
        setResult(`❌ ERROR: ${data.error}`);
      }
    } catch (error) {
      console.error('Test error:', error);
      setResult(`❌ NETWORK ERROR: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testFetchContacts = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('Testing contact fetch...');
      
      const response = await fetch('/api/contact');
      console.log('Fetch response status:', response.status);
      
      const data = await response.json();
      console.log('Fetch response data:', data);

      if (response.ok) {
        setResult(`✅ FETCH SUCCESS: Found ${data.contacts.length} contacts. Total: ${data.pagination.total}`);
      } else {
        setResult(`❌ FETCH ERROR: ${data.error}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setResult(`❌ FETCH NETWORK ERROR: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact API Test</h1>
          
          <div className="space-y-4">
            <button
              onClick={testSubmitContact}
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {loading ? 'Testing...' : 'Test Submit Contact'}
            </button>
            
            <button
              onClick={testFetchContacts}
              disabled={loading}
              className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
            >
              {loading ? 'Testing...' : 'Test Fetch Contacts'}
            </button>
          </div>

          {result && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Test Result:</h3>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">{result}</pre>
            </div>
          )}
          
          <div className="mt-8 text-sm text-gray-600">
            <p>This page tests the contact form API endpoints:</p>
            <ul className="list-disc list-inside mt-2">
              <li>POST /api/contact - Submit a contact form</li>
              <li>GET /api/contact - Fetch contact submissions</li>
            </ul>
            <p className="mt-2">Check the browser console and server logs for detailed information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
