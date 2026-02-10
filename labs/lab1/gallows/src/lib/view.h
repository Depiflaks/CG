//
// Created by smmm on 2/10/26.
//

#ifndef CG_VIEW_H
#define CG_VIEW_H
#include "model.h"

#include <SFML/Graphics.hpp>

#include "lib/core/core.h"
#include <memory>
#include <random>

class GallowsView : public core::AbstractView
{
public:
	GallowsView()
		: AbstractView(800, 800, "gallows")
	{
	}

private:
	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
		m_picture.Draw(target, states);
	}

	void HandleMouseDown(sf::Event::MouseButtonEvent e) override
	{
	}
};

#endif // CG_VIEW_H
