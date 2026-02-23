//
// Created by smmm on 2/15/26.
//

#ifndef CG_STRATEGY_IMPL_H
#define CG_STRATEGY_IMPL_H

#include "../view_manager.h"
#include "sfml_core/button.h"
#include "sfml_core/popup.h"
#include "strategy.h"

namespace view_strategy
{

class AbstractView : public ViewStrategy
{
public:
	using Callback = std::function<void()>;

	explicit AbstractView(view_manager::ViewManager& viewManager,
		Gallows& gallows,
		Callback&& closeWindow)
		: m_letters(&gallows.GetLetters())
		, m_wordView(gallows.GetWordView())
		, m_attemptsNum(gallows.GetAttemptsNumber())
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

	void DrawGame(sf::RenderTarget& target, sf::RenderStates states) const
	{
		DrawLettersRaw(target, states);
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
	int m_attemptsNum{};

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
			auto& cur = m_letterButtons.back();
			switch (letter.State())
			{
			case LetterState::Unknown:
				cur.SetLabelColor(sf::Color(100, 100, 100));
				break;
			case LetterState::Correct:
				std::cout << "correct" << letter.LetterChar() << std::endl;
				cur.SetLabelColor(sf::Color::Green);
				break;
			case LetterState::Incorrect:
				std::cout << "incorrect" << letter.LetterChar() << std::endl;
				cur.SetLabelColor(sf::Color::Red);
				break;
			}
			cur.Rebuild();
		}
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
	}
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
	}
};

} // namespace view_strategy

#endif CG_STRATEGY_IMPL_H
