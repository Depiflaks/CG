//
// Created by smmm on 2/10/26.
//

#ifndef CG_VIEW_H
#define CG_VIEW_H
#include "picture.h"

#include <SFML/Graphics.hpp>

#include "lib/core/core.h"
#include <memory>
#include <random>

class HouseView : public core::AbstractView
{
public:
	HouseView()
		: AbstractView(800, 800, "house")
		, m_picture({ 100.0, 100.0 }, { 600.0, 600.0 })
	{
	}

private:
	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
		m_picture.Draw(target, states);
	}

	void HandleMouseUp(sf::Event::MouseButtonEvent e) override
	{
		m_picture.OnMouseUp(
			{ static_cast<float>(e.x), static_cast<float>(e.y) });
	}

	void HandleMouseDown(sf::Event::MouseButtonEvent e) override
	{
		m_picture.OnMouseDown(
			{ static_cast<float>(e.x), static_cast<float>(e.y) });
	}

	void HandleMouseMove(sf::Event::MouseMoveEvent e) override
	{
		m_picture.OnMouseMove(
			{ static_cast<float>(e.x), static_cast<float>(e.y) });
	}

	void HandleMouseLeave() override
	{
		m_picture.OnMouseLeave();
	}

	void HandleMouseEnter() override
	{
		m_picture.OnMouseEnter();
	}

	Picture m_picture;
};

#endif // CG_VIEW_H
