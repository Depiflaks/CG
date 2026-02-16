#include "view_manager.h"
#include "strategy/strategy_impl.h"

view_manager::ViewManager::ViewManager(Gallows& gallows, closeCallback close)
	: AbstractView(800, 600, "gallows")
	, m_gallows(gallows)
	, m_close(std::move(close))
{
	m_viewStrategies.emplace_back(std::make_unique<view_strategy::GallowsView>(
		*this, gallows, [this] { this->m_close(); }));
	m_viewStrategies.emplace_back(std::make_unique<view_strategy::AttemptsView>(
		*this, gallows, [this] { this->m_close(); }));
	m_current = m_viewStrategies.begin();
}
