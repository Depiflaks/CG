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
	explicit AbstractView(
		view_manager::ViewManager& viewManager, Gallows& gallows)
		: m_letters(&gallows.GetLetters())
		, m_wordView(gallows.GetWordView())
		, m_attemptsNum(gallows.GetAttemptsNumber())
		, m_gallows(gallows)
		, m_viewManager(viewManager)
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

protected:
	void DrawWinPopup(sf::RenderTarget& target, sf::RenderStates states) const
	{
	}

	void DrawLosePopup(sf::RenderTarget& target, sf::RenderStates states) const
	{
	}

	void DrawSwitchButton(
		sf::RenderTarget& target, sf::RenderStates states) const
	{
	}

	const std::vector<Letter>* m_letters;
	std::string m_wordView;
	int m_attemptsNum{};

private:
	void Build()
	{

	}

	Gallows& m_gallows;
	GameState m_currentState{ GameState::InProgress };
	view_manager::ViewManager& m_viewManager;


};

class GallowsView : public AbstractView
{
public:
	GallowsView(view_manager::ViewManager& viewManager, Gallows& gallows,
		const sf::RectangleShape& m_test_obj)
		: AbstractView(viewManager, gallows)
		, m_testObj(m_test_obj)
	{
		Build();
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
		target.draw(m_testObj);
	}

private:
	void Build()
	{
		m_testObj.setPosition(100, 100);
		m_testObj.setSize(sf::Vector2f(100, 100));
		m_testObj.setFillColor(sf::Color::Black);
	}

	sf::RectangleShape m_testObj{};
};

class AttemptsView : public AbstractView
{
public:
	AttemptsView(view_manager::ViewManager& viewManager, Gallows& gallows,
		const sf::RectangleShape& m_test_obj)
		: AbstractView(viewManager, gallows)
		, m_testObj(m_test_obj)
	{
		Build();
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
		target.draw(m_testObj);
	}

private:
	void Build()
	{
		m_testObj.setPosition(100, 100);
		m_testObj.setSize(sf::Vector2f(100, 100));
		m_testObj.setFillColor(sf::Color::Red);
	}
	sf::RectangleShape m_testObj{};
};

} // namespace view_strategy

#endif // CG_STRATEGY_IMPL_H
