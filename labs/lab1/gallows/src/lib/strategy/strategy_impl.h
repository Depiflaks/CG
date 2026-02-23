//
// Created by smmm on 2/15/26.
//

#ifndef CG_STRATEGY_IMPL_H
#define CG_STRATEGY_IMPL_H

#include "../view_manager.h"
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
		// , m_switchButton([this] { this->m_viewManager.NextView(); },
		// 	  "switch view",
		// 	  sf::Color::Black,
		// 	  16)
		// , m_winPopup(
		// 	  { 150, 150 },
		// 	  "Victory!",
		// 	  sf::Color::Green,
		// 	  [this] { this->m_closeWindow(); },
		// 	  [this] { this->m_gallows.NewGame(); })
		// , m_losePopup(
		// 	  { 150, 150 },
		// 	  "Game Over!",
		// 	  sf::Color::Red,
		// 	  [this] { this->m_closeWindow(); },
		// 	  [this] { this->m_gallows.NewGame(); })
		, m_closeWindow(std::move(closeWindow))
	{
	}

	void OnWordChanged() override
	{
		m_letters = &m_gallows.GetLetters();
		m_attemptsNum = m_gallows.GetAttemptsNumber();
		m_wordView = m_gallows.GetWordView();
		m_currentState = m_gallows.GetGameState();
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
		m_currentState = GameState::Victory;
		DrawGame(target, states);
		// m_switchButton.Draw(target, states);
		switch (m_currentState)
		{
		case GameState::InProgress:
			break;
		case GameState::GameOver:
			DrawLosePopup(target, states);
			break;
		case GameState::Victory:
			DrawWinPopup(target, states);
			break;
		}
	}

	virtual void DrawGame(sf::RenderTarget& target, sf::RenderStates states)
		= 0;

	void OnClick(sf::Vector2f position) const override
	{
		// if (m_switchButton.Contains(position))
		// {
		// 	m_switchButton.OnClick();
		// }
	}

protected:
	void DrawWinPopup(sf::RenderTarget& target, sf::RenderStates states)
	{
		// m_winPopup.Draw(target, states);
	}

	void DrawLosePopup(sf::RenderTarget& target, sf::RenderStates states)
	{
		// m_losePopup.Draw(target, states);
	}

	void DrawSwitchButton(
		sf::RenderTarget& target, sf::RenderStates states) const
	{
		// m_switchButton.Draw(target, states);
	}

	const std::vector<Letter>* m_letters;
	std::string m_wordView;
	int m_attemptsNum{};

private:
	Gallows& m_gallows;
	GameState m_currentState{ GameState::InProgress };
	view_manager::ViewManager& m_viewManager;

	// Button m_switchButton;
	// Popup m_winPopup;
	// Popup m_losePopup;

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

	void DrawGame(sf::RenderTarget& target, sf::RenderStates states) override
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

	void DrawGame(sf::RenderTarget& target, sf::RenderStates states) override
	{
	}
};

} // namespace view_strategy

#endif // CG_STRATEGY_IMPL_H
