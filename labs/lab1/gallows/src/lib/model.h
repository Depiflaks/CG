#ifndef CG_MODEL_H
#define CG_MODEL_H

#include <cctype>
#include <fstream>
#include <iostream>
#include <random>
#include <ranges>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <vector>

inline bool LoadDictionary(const std::string& filename,
	std::unordered_map<std::string, std::string>& dictionary)
{
	std::ifstream file(filename);
	if (!file.is_open())
	{
		return false;
	}

	std::string line;
	while (std::getline(file, line))
	{
		if (line.empty())
			continue;

		auto pos = line.find(':');
		if (pos == std::string::npos)
			continue;

		std::string word = line.substr(0, pos);
		std::string description = line.substr(pos + 1);

		word.erase(0, word.find_first_not_of(" \t"));
		word.erase(word.find_last_not_of(" \t") + 1);
		description.erase(0, description.find_first_not_of(" \t"));
		description.erase(description.find_last_not_of(" \t") + 1);

		dictionary[word] = description;
	}

	file.close();
	return true;
}

enum class LetterState
{
	Unknown,
	Correct,
	Incorrect
};

enum class GameState
{
	InProgress,
	GameOver,
	Victory
};

class GallowsObserver
{
public:
	virtual ~GallowsObserver() = default;
	virtual void OnWordChanged() = 0;
};

class Letter
{
public:
	explicit Letter(char letter, LetterState state = LetterState::Unknown)
		: m_letter(letter)
		, m_state(state)
	{
	}

	char LetterChar() const
	{
		return m_letter;
	}

	LetterState State() const
	{
		return m_state;
	}

	void SetState(LetterState s)
	{
		m_state = s;
	}

private:
	char m_letter{};
	LetterState m_state{ LetterState::Unknown };
};

class Gallows
{
public:
	explicit Gallows(const std::string& dictPath, int attemptsNum = 7)
		: m_attemptsNum(attemptsNum)
	{
		if (m_attemptsNum <= 0)
			throw std::invalid_argument("attemptsNum must be > 0");

		LoadDictionary(dictPath, m_dictionary);

		ResetLetters();
		NewGame();
	}

	const std::vector<Letter>& GetLetters() const
	{
		return m_letters;
	}

	int GetAttemptsNumber() const
	{
		return m_attemptsNum;
	}

	int GetInitialAttemptsNumber() const
	{
		return m_initialAttempts;
	}

	std::string GetWordView() const
	{
		return m_wordView;
	}

	std::string GetDescription() const
	{
		const auto it = m_dictionary.find(m_hiddenWord);
		return it == m_dictionary.end() ? std::string{} : it->second;
	}

	GameState GetGameState() const
	{
		return m_currentState;
	}

	void CheckLetter(char ch)
	{
		if (m_currentState != GameState::InProgress)
			return;

		ch = Normalize(ch);
		auto idx = FindLetterIndex(ch);
		if (idx < 0)
			return;

		if (m_letters[static_cast<size_t>(idx)].State() != LetterState::Unknown)
			return;

		const bool inWord = (m_hiddenWord.find(ch) != std::string::npos);
		m_letters[static_cast<size_t>(idx)].SetState(
			inWord ? LetterState::Correct : LetterState::Incorrect);

		if (inWord)
		{
			for (size_t i = 0; i < m_hiddenWord.size(); ++i)
			{
				if (m_hiddenWord[i] == ch)
					m_wordView[i] = ch;
			}

			if (m_wordView == m_hiddenWord)
				m_currentState = GameState::Victory;
		}
		else
		{
			--m_attemptsNum;
			if (m_attemptsNum <= 0)
				m_currentState = GameState::GameOver;
		}
		NotifyObservers();
	}

	void NewGame()
	{
		std::cout << "New game started" << std::endl;
		if (m_dictionary.empty())
			throw std::runtime_error("dictionary is empty");

		m_hiddenWord = PickRandomWord();
		m_wordView.assign(m_hiddenWord.size(), '_');
		m_currentState = GameState::InProgress;

		ResetLetters();
		m_attemptsNum = m_initialAttempts;
		NotifyObservers();
	}

	void RegisterObserver(GallowsObserver& observer)
	{
		m_observers.emplace_back(&observer);
	}

private:
	void ResetLetters()
	{
		m_letters.clear();
		for (char c = 'A'; c <= 'Z'; ++c)
			m_letters.emplace_back(c, LetterState::Unknown);
	}

	static char Normalize(char ch)
	{
		return static_cast<char>(std::toupper(static_cast<unsigned char>(ch)));
	}

	static int FindLetterIndex(char ch)
	{
		if (ch < 'A' || ch > 'Z')
			return -1;
		return ch - 'A';
	}

	std::string PickRandomWord()
	{
		static std::mt19937 rng{ std::random_device{}() };

		std::vector<std::string> keys;
		keys.reserve(m_dictionary.size());
		for (const auto& k : m_dictionary | std::views::keys)
			keys.push_back(k);

		std::uniform_int_distribution<size_t> dist(0, keys.size() - 1);
		return keys[dist(rng)];
	}

	void NotifyObservers() const
	{
		for (const auto& ob : m_observers)
		{
			ob->OnWordChanged();
		}
	}

	std::vector<Letter> m_letters;
	std::string m_hiddenWord;
	std::string m_wordView;
	int m_attemptsNum{};
	const int m_initialAttempts{ m_attemptsNum };
	std::unordered_map<std::string, std::string> m_dictionary;
	GameState m_currentState{ GameState::InProgress };

	std::vector<GallowsObserver*> m_observers{};
};

#endif // CG_MODEL_H
