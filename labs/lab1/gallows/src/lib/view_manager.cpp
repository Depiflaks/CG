#include "view_manager.h"
#include "strategy/strategy_impl.h"

view_manager::ViewManager::ViewManager(Gallows& gallows)
	: AbstractView(800, 600, "gallows")
	, m_gallows(gallows)
{
	m_viewStrategies.emplace_back(
		std::make_unique<view_strategy::GallowsView>(*this, gallows));
	m_viewStrategies.emplace_back(
		std::make_unique<view_strategy::AttemptsView>(*this, gallows));
	m_current = m_viewStrategies.begin();
}
