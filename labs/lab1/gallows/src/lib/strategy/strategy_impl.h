//
// Created by smmm on 2/15/26.
//

#ifndef CG_STRATEGY_IMPL_H
#define CG_STRATEGY_IMPL_H

#include "../view_manager.h"
#include "hangman/hangman.h"
#include "sfml_core/button.h"
#include "sfml_core/popup.h"
#include "strategy.h"

namespace view_strategy
{

inline std::string AddSpacesBetweenChars(const std::string& input)
{
	if (input.empty())
		return input;

	std::string result;
	result.reserve(input.size() * 2);

	for (size_t i = 0; i < input.size(); ++i)
	{
		result += input[i];
		if (i < input.size() - 1)
		{
			result += ' ';
		}
	}

	return result;
}

class AbstractView : public ViewStrategy
{
public:
	using Callback = std::function<void()>;

	explicit AbstractView(view_manager::ViewManager& viewManager,
		Gallows& gallows,
		Callback&& closeWindow)
		: m_letters(&gallows.GetLetters())
		, m_wordView(gallows.GetWordView())
		, m_description(gallows.GetDescription())
		, m_attemptsNum(gallows.GetAttemptsNumber())
		, m_initialAttempts(gallows.GetInitialAttemptsNumber())
		, m_gallows(gallows)
		, m_viewManager(viewManager)
		, m_switchButton([this] { this->m_viewManager.NextView(); })
		, m_winPopup([this] { this->m_closeWindow(); },
			  [this] { this->m_gallows.NewGame(); })
		, m_losePopup([this] { this->m_closeWindow(); },
			  [this] { this->m_gallows.NewGame(); })
		, m_closeWindow(std::move(closeWindow))
	{
		Build();
	}

	void OnWordChanged() override
	{
		m_letters = &m_gallows.GetLetters();
		m_attemptsNum = m_gallows.GetAttemptsNumber();
		m_wordView = m_gallows.GetWordView();
		m_currentState = m_gallows.GetGameState();
		m_description = m_gallows.GetDescription();
		UpdateLetterButtons();
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
		DrawGame(target, states);
		m_switchButton.Draw(target, states);
		switch (m_currentState)
		{
		case GameState::InProgress:
			break;
		case GameState::GameOver:
			m_losePopup.Draw(target, states);
			break;
		case GameState::Victory:
			m_winPopup.Draw(target, states);
			break;
		}
	}

	void OnClick(sf::Vector2f position) const override
	{
		switch (m_currentState)
		{
		case GameState::InProgress:
			if (m_switchButton.Contains(position))
			{
				m_switchButton.OnClick();
			}
			for (auto& letter : m_letterButtons)
			{
				if (letter.Contains(position))
				{
					letter.OnClick();
				}
			}
			break;
		case GameState::GameOver:
			m_losePopup.OnClick(position);
			break;
		case GameState::Victory:
			m_winPopup.OnClick(position);
			break;
		}
	}

protected:
	void DrawLettersRaw(sf::RenderTarget& target, sf::RenderStates states) const
	{
		for (auto& letter : m_letterButtons)
		{
			letter.Draw(target, states);
		}
	}

	std::vector<sfml_core::Button> m_letterButtons;
	const std::vector<Letter>* m_letters;
	std::string m_wordView;
	std::string m_description;
	int m_attemptsNum{};
	int m_initialAttempts{};

private:
	void Build()
	{
		m_switchButton.SetCharSize(16);
		m_switchButton.SetLabel("Switch");
		m_switchButton.SetLabelColor(sf::Color::Blue);
		m_switchButton.SetPosition({ 20, 20 });

		m_winPopup.SetBackgroundColor(sf::Color(210, 255, 209));
		m_winPopup.SetBackgroundOutlineColor(sf::Color::Black);
		m_winPopup.SetBackgroundOutlineThickness(2);
		m_winPopup.SetCaption("Victory!!!");
		m_winPopup.SetCaptionColor(sf::Color::Green);
		m_winPopup.SetBounds({ 300, 150 });

		m_losePopup.SetBackgroundColor(sf::Color(255, 209, 209));
		m_losePopup.SetBackgroundOutlineColor(sf::Color::Black);
		m_losePopup.SetBackgroundOutlineThickness(1);
		m_losePopup.SetCaption("Game Over!!!");
		m_losePopup.SetCaptionColor(sf::Color::Red);
		m_losePopup.SetBounds({ 300, 150 });

		m_switchButton.Rebuild();
		m_winPopup.Rebuild();
		m_losePopup.Rebuild();

		BuildLetters();
	}

	void BuildLetters()
	{
		constexpr float xOffset{ 50 };
		constexpr float yOffset{ 500 };
		m_letterButtons.reserve(m_letters->size());
		m_letters = &m_gallows.GetLetters();
		for (int i = 0; i < m_letters->size(); ++i)
		{
			auto& letter = m_letters->at(i);
			m_letterButtons.push_back(sfml_core::Button{ [this, letter] {
				this->m_gallows.CheckLetter(letter.LetterChar());
			} });
			auto& cur = m_letterButtons.back();
			switch (letter.State())
			{
			case LetterState::Unknown:
				cur.SetLabelColor(sf::Color(100, 100, 100));
				break;
			case LetterState::Correct:
				cur.SetLabelColor(sf::Color::Green);
				break;
			case LetterState::Incorrect:
				cur.SetLabelColor(sf::Color::Red);
				break;
			}
			cur.SetPadding(2, 2);
			cur.SetCharSize(20);
			cur.SetLabel(std::string{ letter.LetterChar() });
			cur.SetPosition({ xOffset + 25 * i, yOffset });
			cur.Rebuild();
		}
	}

	void UpdateLetterButtons()
	{
		for (int i = 0; i < m_letterButtons.size(); ++i)
		{
			auto& letter = m_letters->at(i);
			auto& cur = m_letterButtons[i];
			switch (letter.State())
			{
			case LetterState::Unknown:
				cur.SetLabelColor(sf::Color(100, 100, 100));
				break;
			case LetterState::Correct:
				cur.SetLabelColor(sf::Color::Green);
				break;
			case LetterState::Incorrect:
				cur.SetLabelColor(sf::Color::Red);
				break;
			}
			cur.Rebuild();
		}
	}

	virtual void DrawGameState(
		sf::RenderTarget& target, sf::RenderStates states) const = 0;


	void DrawGame(sf::RenderTarget& target, sf::RenderStates states) const
	{
		DrawLettersRaw(target, states);
		DrawGameState(target, states);
	}

	Gallows& m_gallows;
	GameState m_currentState{ GameState::InProgress };
	view_manager::ViewManager& m_viewManager;

	sfml_core::Button m_switchButton;
	sfml_core::Popup m_winPopup;
	sfml_core::Popup m_losePopup;

	Callback m_closeWindow;
};

class GallowsView : public AbstractView
{
public:
	GallowsView(view_manager::ViewManager& viewManager,
		Gallows& gallows,
		Callback&& close)
		: AbstractView(viewManager, gallows, std::move(close))
	{
		Build();
	}

private:
	void Build()
	{
		m_font = sfml_core::loadFont();
	}

	void DrawGameState(
		sf::RenderTarget& target, sf::RenderStates states) const override
	{
		hangman::DrawHangman(target, m_attemptsNum, m_config);
		DrawWordViewGallows(target);
		DrawDescriptionGallows(target);
	}

	void DrawWordViewGallows(sf::RenderTarget& target) const
	{

		sf::Text text(AddSpacesBetweenChars(m_wordView), m_font, 48);
		text.setFillColor(sf::Color::Black);
		text.setPosition({ 400.f, 200.f });
		target.draw(text);
	}

	void DrawDescriptionGallows(sf::RenderTarget& target) const
	{
		sf::Text text(m_description, m_font, 24);
		text.setFillColor(sf::Color::Black);
		text.setPosition({ 50.f, 50.f });
		target.draw(text);
	}

	hangman::HangmanConfig m_config;
	sf::Font m_font;
};

class AttemptsView : public AbstractView
{
public:
	AttemptsView(view_manager::ViewManager& viewManager,
		Gallows& gallows,
		Callback&& closeWindow)
		: AbstractView(viewManager, gallows, std::move(closeWindow))
	{
		Build();
	}

private:
	void Build()
	{
		m_font = sfml_core::loadFont();
	}

	void DrawGameState(
		sf::RenderTarget& target, sf::RenderStates states) const override
	{
		DrawAttemptsLeft(target);
		DrawWordViewAttempts(target);
		DrawDescriptionAttempts(target);
	}

	void DrawAttemptsLeft(sf::RenderTarget& target) const
	{
		sf::Text text("Attempts left: "
				+ std::to_string(m_initialAttempts - m_attemptsNum) + " / "
				+ std::to_string(m_initialAttempts),
			m_font,
			28);
		text.setFillColor(sf::Color::Green);
		text.setPosition({ 40.f, 80.f });
		target.draw(text);
	}

	void DrawWordViewAttempts(sf::RenderTarget& target) const
	{
		sf::Text text(AddSpacesBetweenChars(m_wordView), m_font, 36);
		text.setFillColor(sf::Color::Blue);
		text.setPosition({ 150.f, 150.f });
		target.draw(text);
	}

	void DrawDescriptionAttempts(sf::RenderTarget& target) const
	{
		sf::Text text(m_description, m_font, 30);
		text.setFillColor(sf::Color::Magenta);
		text.setPosition({ 50.f, 250.f });
		target.draw(text);
	}
	sf::Font m_font;
};

} // namespace view_strategy

#endif CG_STRATEGY_IMPL_H
