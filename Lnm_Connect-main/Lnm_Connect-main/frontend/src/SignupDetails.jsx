import React, { useState } from "react";
import { SKILLS, INTERESTS } from "./skills_interests_data";

const isValidGithub = (url) => url.endsWith(".github");
const isValidPortfolio = (url) => url.endsWith(".pdf");

const TagInput = ({ label, tags, setTags, placeholder, options }) => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val.trim()) {
      setSuggestions(options.filter(opt =>
        opt.toLowerCase().includes(val.toLowerCase()) && !tags.includes(opt)
      ).slice(0, 8));
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (option) => {
    if (!tags.includes(option)) setTags([...tags, option]);
    setInput("");
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (input.trim() && suggestions.length > 0) {
        e.preventDefault();
        handleSelect(suggestions[0]);
      } else {
        // Prevent form submit if focus is in this input
        e.preventDefault();
      }
    }
  };

  const removeTag = (tag) => setTags(tags.filter(t => t !== tag));

  return (
    <div className="mb-4 relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span key={tag} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center">
            {tag}
            <button type="button" className="ml-2 text-xs" onClick={() => removeTag(tag)}>&times;</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder={placeholder}
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-200 rounded-lg mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
          {suggestions.map(option => (
            <li
              key={option}
              className="px-4 py-2 cursor-pointer hover:bg-indigo-100"
              onMouseDown={() => handleSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const SignupDetails = ({ onSubmit, onSkip }) => {
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [githubError, setGithubError] = useState("");
  const [portfolioError, setPortfolioError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;
    if (github && !isValidGithub(github)) {
      setGithubError("GitHub link must end with .github");
      valid = false;
    } else {
      setGithubError("");
    }
    if (portfolio && !isValidPortfolio(portfolio)) {
      setPortfolioError("Portfolio must be a .pdf file");
      valid = false;
    } else {
      setPortfolioError("");
    }
    if (valid) {
      onSubmit({ skills, interests, githubProfile: github, portfolio });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">Tell us more about you</h2>
  <TagInput label="Skills" tags={skills} setTags={setSkills} placeholder="Type a skill and press Enter" options={SKILLS} />
  <TagInput label="Interests" tags={interests} setTags={setInterests} placeholder="Type an interest and press Enter" options={INTERESTS} />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Profile</label>
          <input
            type="text"
            value={github}
            onChange={e => setGithub(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="e.g. username.github"
          />
          {githubError && <div className="text-red-500 text-xs mt-1">{githubError}</div>}
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio (PDF only)</label>
          <input
            type="text"
            value={portfolio}
            onChange={e => setPortfolio(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="e.g. myportfolio.pdf"
          />
          {portfolioError && <div className="text-red-500 text-xs mt-1">{portfolioError}</div>}
        </div>
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onSkip}
            className="text-indigo-600 hover:underline text-sm"
          >
            Skip for now
          </button>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupDetails;
