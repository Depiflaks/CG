#include "view_manager.h"
#include "strategy/strategy_impl.h"

view_manager::ViewManager::ViewManager()
	: AbstractView(800, 600, "gallows")
{
	m_viewStrategies.emplace_back(std::make_unique<view_strategy::GallowsView>(*this));
	m_viewStrategies.emplace_back(std::make_unique<view_strategy::AttemptsView>(*this));
	m_current = m_viewStrategies.begin();
}

