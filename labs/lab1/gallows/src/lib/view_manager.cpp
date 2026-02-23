#include "view_manager.h"
#include "strategy/strategy_impl.h"

view_manager::ViewManager::ViewManager(Gallows& gallows)
	: AbstractView(800, 600, "gallows")
	, m_gallows(gallows)
{
	m_viewStrategies.emplace_back(std::make_unique<view_strategy::GallowsView>(
		*this, gallows, [this] { this->Close(); }));
	m_viewStrategies.emplace_back(std::make_unique<view_strategy::AttemptsView>(
		*this, gallows, [this] { this->Close(); }));
	for (auto& strategy : m_viewStrategies)
	{
		m_gallows.RegisterObserver(*strategy.get());
	}
	m_current = m_viewStrategies.begin();
}
