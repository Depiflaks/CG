//
// Created by smmm on 2/10/26.
//

#ifndef CG_VIEW_H
#define CG_VIEW_H
#include "circle.h"

#include <SFML/Graphics.hpp>

#include "lib/core/core.h"
#include <SFML/Graphics/Color.hpp>
#include <SFML/System/Vector2.hpp>

class CircleView : public core::AbstractView
{
public:
	CircleView()
		: AbstractView(800, 800, "circle")
		, m_circle({ 750.0, 300.0 }, 100, sf::Color::Blue)
	{
		m_circle.DisableFill();
		m_circle.SetThickness(1.0);
	}

private:
	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
		m_circle.Draw(target, states);
	}

	Circle m_circle;
};

#endif // CG_VIEW_H
