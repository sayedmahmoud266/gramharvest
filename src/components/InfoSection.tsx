import React, { useState } from 'react';

const InfoSection: React.FC = () => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showLicense, setShowLicense] = useState(false);

  return (
    <div className="space-y-4 text-sm">
      {/* GitHub Stars Badge */}
      <div className="text-center">
        <a 
          href="https://github.com/sayedmahmoud266/gramharvest"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img 
            src="https://img.shields.io/github/stars/sayedmahmoud266/gramharvest?style=for-the-badge&logo=github" 
            alt="GitHub Stars" 
            className="mx-auto hover:opacity-80 transition-opacity duration-200"
          />
        </a>
      </div>

      {/* Links Section */}
      <div className="flex flex-col space-y-2">
        <a 
          href="https://github.com/sayedmahmoud266/gramharvest/issues/new?template=bug_report.md&title=[Bug]%20"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white underline text-center"
        >
          🐛 Report Issues
        </a>
        <a 
          href="https://github.com/sayedmahmoud266/gramharvest/issues/new?template=feature_request.md&title=[Feature]%20"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white underline text-center"
        >
          💡 Suggest Features
        </a>
      </div>

      {/* Buy Me a Coffee Section */}
      <div className="text-center space-y-2">
        <p className="text-white/80 text-xs">
          If you like this extension, buy me a coffee 😉
        </p>
        <div className="flex justify-center">
          <a 
            href="https://www.buymeacoffee.com/sayedmahmoud266"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-[#bd0505] hover:bg-[#a00404] text-white rounded-lg transition-colors duration-200 text-xs font-medium"
          >
            ☕ Buy me a coffee
          </a>
        </div>
      </div>

      {/* Privacy Policy */}
      <div className="bg-white/10 rounded-lg p-3">
        <button
          onClick={() => setShowPrivacyPolicy(!showPrivacyPolicy)}
          className="w-full text-left text-white/90 font-medium flex items-center justify-between"
        >
          🔒 Privacy Policy
          <span className={`transform transition-transform ${showPrivacyPolicy ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {showPrivacyPolicy && (
          <div className="mt-2 text-white/70 text-xs space-y-2">
            <p>
              <strong>Data Collection:</strong> This extension does not collect any usage data or personal information.
            </p>
            <p>
              <strong>Data Storage:</strong> All scraped data is stored locally in your browser and never transmitted to any remote servers.
            </p>
            <p>
              <strong>Open Source:</strong> This extension is completely open source. You can review the entire codebase on GitHub to verify our privacy practices.
            </p>
            <p>
              <strong>Your Privacy:</strong> Your data remains private and under your complete control at all times.
            </p>
          </div>
        )}
      </div>

      {/* License Agreement */}
      <div className="bg-white/10 rounded-lg p-3">
        <button
          onClick={() => setShowLicense(!showLicense)}
          className="w-full text-left text-white/90 font-medium flex items-center justify-between"
        >
          ⚖️ License & Disclaimer
          <span className={`transform transition-transform ${showLicense ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {showLicense && (
          <div className="mt-2 text-white/70 text-xs space-y-2">
            <p>
              <strong>Responsibility:</strong> This extension and its developers are not responsible for any misuse of this tool.
            </p>
            <p>
              <strong>Data Rights:</strong> Users must only collect data from accounts they have explicit permission to access. Respect others' privacy and Instagram's terms of service.
            </p>
            <p>
              <strong>Legal Disclaimer:</strong> Any data collected is the sole responsibility of the user. The developers do not share any legal liability for misuse of collected data.
            </p>
            <p>
              <strong>Ethical Use:</strong> This tool is intended for legitimate research, backup, and personal use only.
            </p>
          </div>
        )}
      </div>

      {/* Developer Credit */}
      <div className="text-center text-white/60 text-xs">
        Developed with ❤️ by{' '}
        <a 
          href="https://sayedmahmoud266.website"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white underline"
        >
          sayedmahmoud266
        </a>
      </div>
    </div>
  );
};

export default InfoSection;
