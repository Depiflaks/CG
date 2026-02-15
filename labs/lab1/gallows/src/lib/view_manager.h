//
// Created by smmm on 2/10/26.
//

#ifndef CG_VIEW_H
#define CG_VIEW_H

#include <SFML/Graphics.hpp>

#include "lib/strategy/strategy.h"
#include <memory>
#include <sfml_core/core.h>

#include <list>

namespace view_manager
{

class ViewManager : public core::AbstractView
{
public:
	ViewManager();

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
	};

	std::list<std::unique_ptr<view_strategy::ViewStrategy>> m_viewStrategies{};
	std::list<std::unique_ptr<view_strategy::ViewStrategy>>::iterator
		m_current{};
};

} // namespace view_manager
#endif // CG_VIEW_H
