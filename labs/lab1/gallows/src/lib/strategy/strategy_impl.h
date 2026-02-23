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

	virtual void DrawGame(sf::RenderTarget& target, sf::RenderStates states)
		= 0;

	void OnClick(sf::Vector2f position) const override
	{
		switch (m_currentState)
		{
		case GameState::InProgress:
			if (m_switchButton.Contains(position))
			{
				m_switchButton.OnClick();
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

#endif CG_STRATEGY_IMPL_H
