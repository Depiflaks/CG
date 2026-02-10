#ifndef CG_MODEL_H
#define CG_MODEL_H

#include <algorithm>
#include <cctype>
#include <random>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <vector>

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
	explicit Gallows(int attemptsNum = 6)
		: m_attemptsNum(attemptsNum)
	{
		if (m_attemptsNum <= 0)
			throw std::invalid_argument("attemptsNum must be > 0");

		m_dictionary = { { "HOUSE", "A building for living." },
			{ "WINDOW", "An opening in a wall with glass." },
			{ "GARDEN", "A place where plants are grown." },
			{ "CLOUD", "A visible mass of condensed water vapor." },
			{ "SUN", "The star at the center of the Solar System." } };

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
	std::vector<char> GetCurrentWord() const
	{
		return { m_currentWord.begin(), m_currentWord.end() };
	}
	std::string GetDisplayWord() const
	{
		return m_displayWord;
	}
	std::string GetDescription() const
	{
		auto it = m_dictionary.find(m_currentWord);
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

		const bool inWord = (m_currentWord.find(ch) != std::string::npos);
		m_letters[static_cast<size_t>(idx)].SetState(
			inWord ? LetterState::Correct : LetterState::Incorrect);

		if (inWord)
		{
			for (size_t i = 0; i < m_currentWord.size(); ++i)
			{
				if (m_currentWord[i] == ch)
					m_displayWord[i] = ch;
			}

			if (m_displayWord == m_currentWord)
				m_currentState = GameState::Victory;
		}
		else
		{
			--m_attemptsNum;
			if (m_attemptsNum <= 0)
				m_currentState = GameState::GameOver;
		}
	}

	void NewGame()
	{
		if (m_dictionary.empty())
			throw std::runtime_error("dictionary is empty");

		m_currentWord = PickRandomWord();
		m_displayWord.assign(m_currentWord.size(), '_');
		m_currentState = GameState::InProgress;

		ResetLetters();
		m_attemptsNum = m_initialAttempts;
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

	int FindLetterIndex(char ch) const
	{
		if (ch < 'A' || ch > 'Z')
			return -1;
		return static_cast<int>(ch - 'A');
	}

	std::string PickRandomWord()
	{
		static std::mt19937 rng{ std::random_device{}() };

		std::vector<std::string> keys;
		keys.reserve(m_dictionary.size());
		for (const auto& [k, _] : m_dictionary)
			keys.push_back(k);

		std::uniform_int_distribution<size_t> dist(0, keys.size() - 1);
		return keys[dist(rng)];
	}

	std::vector<Letter> m_letters;
	std::string m_currentWord;
	std::string m_displayWord;
	int m_attemptsNum{};
	const int m_initialAttempts{ m_attemptsNum };
	std::unordered_map<std::string, std::string> m_dictionary;
	GameState m_currentState{ GameState::InProgress };
};
#endif // CG_MODEL_H
