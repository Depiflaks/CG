//
// Created by smmm on 2/10/26.
//

#ifndef CG_VIEW_H
#define CG_VIEW_H
#include "letter.h"

#include <SFML/Graphics.hpp>
#include <SFML/Window/VideoMode.hpp>

#include "lib/core/core.h"
#include <algorithm> // std::min
#include <iostream>
#include <memory>

class InitialsView : public core::AbstractView
{
public:
	InitialsView()
		: AbstractView(800, 800, "initials")
	{
		m_letters = {};
	}

private:
	void HandleEvents() override
	{
		sf::Event e;
		while (m_window.pollEvent(e))
		{
			if (e.type == sf::Event::Closed)
				m_window.close();

			if (e.type == sf::Event::MouseButtonPressed
				&& e.mouseButton.button == sf::Mouse::Left)
			{
				m_velocityY = -m_jumpSpeed;
			}
		}
	}

	void UpdateObjects(float dt) override
	{
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
	}

	std::vector<std::unique_ptr<Letter>> m_letters{};

	const float m_gravity = 1800.f;
	const float m_jumpSpeed = 900.f;
	const float m_groundY = 600.f;
};

#endif // CG_VIEW_H
