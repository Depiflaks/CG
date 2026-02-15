//
// Created by smmm on 2/15/26.
//

#ifndef CG_STRATEGY_IMPL_H
#define CG_STRATEGY_IMPL_H

#include "../view_manager.h"
#include "view_strategy.h"

class GallowsView
	: private GallowsObserver
	, public view_strategy::ViewStrategy
{
public:
	void OnWordChanged() override
	{
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
	}
};

class AttemptsView
	: private GallowsObserver
	, public view_strategy::ViewStrategy
{
public:
	void OnWordChanged() override
	{
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
	}
};

#endif // CG_STRATEGY_IMPL_H
