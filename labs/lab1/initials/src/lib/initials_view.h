//
// Created by smmm on 2/10/26.
//

#ifndef CG_VIEW_H
#define CG_VIEW_H
#include <SFML/Graphics.hpp>
#include <SFML/Window/VideoMode.hpp>

#include "lib/core/core.h"
#include <algorithm> // std::min
#include <iostream>

class InitialsView : public core::AbstractView
{
public:
	InitialsView()
		: AbstractView(800, 800, "initials")
	{
		m_text.setFont(m_font);

		if (!m_font.loadFromFile("assets/DejaVuSans.ttf"))
		{
			m_window.close();
			return;
		}
		m_text.setString(sf::String("SSU"));
		m_text.setCharacterSize(160);
		m_text.setFillColor(sf::Color::White);

		auto b = m_text.getLocalBounds();
		m_text.setOrigin(b.left + b.width * 0.5f, b.top + b.height * 0.5f);

		m_text.setPosition(400.f, m_groundY);

		m_velocityY = -m_jumpSpeed;
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

	float m_velocityY = 0.f;

	const float m_gravity = 1800.f;
	const float m_jumpSpeed = 900.f;
	const float m_groundY = 600.f;
};

#endif // CG_VIEW_H
