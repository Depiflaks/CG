//
// Created by smmm on 2/15/26.
//

#ifndef CG_STRATEGY_IMPL_H
#define CG_STRATEGY_IMPL_H

#include "../view_manager.h"
#include "i_strategy.h"

namespace view_strategy
{

class AbstractView : public ViewStrategy
{
public:
	explicit AbstractView(view_manager::ViewManager& m_view_manager)
		: m_viewManager(m_view_manager)
	{
	}

protected:
	void NextView() const
	{
		m_viewManager.NextView();
	}

private:
	view_manager::ViewManager& m_viewManager;
};

class GallowsView : public AbstractView
{
public:
	explicit GallowsView(view_manager::ViewManager& m_view_manager)
		: AbstractView(m_view_manager)
	{
		Build();
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
		target.draw(m_testObj);
	}

	void OnWordChanged() override
	{
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
	explicit AttemptsView(view_manager::ViewManager& m_view_manager)
		: AbstractView(m_view_manager)
	{
		Build();
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
		target.draw(m_testObj);
	}

	void OnWordChanged() override
	{
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
