//
// Created by smmm on 2/10/26.
//

#ifndef CG_VIEW_H
#define CG_VIEW_H

#include <SFML/Graphics.hpp>

#include "lib/strategy/strategy.h"
#include <memory>
#include <sfml_core/sfml_core.h>
#include <sfml_core/view.h>

#include <list>

namespace view_manager
{

class ViewManager : public sfml_core::AbstractView
{
public:
	explicit ViewManager(Gallows& gallows);

	void NextView()
	{
		++m_current;
		if (m_current == m_viewStrategies.end())
		{
			m_current = m_viewStrategies.begin();
		}
	}

private:
	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
		m_current->get()->Draw(target, states);
	}

	void HandleMouseDown(sf::Event::MouseButtonEvent e) override
	{
		m_current->get()->OnClick(
			{ static_cast<float>(e.x), static_cast<float>(e.y) });
	}

	Gallows& m_gallows;
	std::list<std::unique_ptr<view_strategy::ViewStrategy>> m_viewStrategies{};
	std::list<std::unique_ptr<view_strategy::ViewStrategy>>::iterator
		m_current{};
};

} // namespace view_manager
#endif // CG_VIEW_H
