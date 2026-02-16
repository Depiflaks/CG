//
// Created by smmm on 2/16/26.
//

#ifndef CG_SFML_CORE_VIEW_H
#define CG_SFML_CORE_VIEW_H

#include <SFML/Graphics/Color.hpp>
#include <SFML/Graphics/RenderStates.hpp>
#include <SFML/Window/Event.hpp>
#include <SFML/Window/VideoMode.hpp>
#include <string>
#include <sys/types.h>

namespace sfml_core
{

class AbstractView
{
public:
	virtual ~AbstractView() = default;

	AbstractView(uint w, uint h, const std::string& title)
		: m_window(sf::VideoMode(w, h), title)
	{
	}

	void Run()
	{
		while (m_window.isOpen())
		{
			float dt = m_clock.restart().asSeconds();
			dt = std::min(dt, 0.033f);

			HandleEvents();
			UpdateObjects(dt);
			Redraw();
		}
	}

private:
	void Redraw()
	{
		m_window.clear(sf::Color::White);
		Draw(m_window, sf::RenderStates::Default);
		m_window.display();
	}

	virtual void Draw(sf::RenderTarget& target, sf::RenderStates states) = 0;

	virtual void UpdateObjects(float dt)
	{
	}

	virtual void HandleMouseUp(sf::Event::MouseButtonEvent e)
	{
	}

	virtual void HandleMouseDown(sf::Event::MouseButtonEvent e)
	{
	}

	virtual void HandleMouseMove(sf::Event::MouseMoveEvent e)
	{
	}

	virtual void HandleMouseLeave()
	{
	}

	virtual void HandleMouseEnter()
	{
	}

	void HandleEvents()
	{
		sf::Event e{};
		while (m_window.pollEvent(e))
		{
			if (e.type == sf::Event::Closed)
			{
				m_window.close();
			}

			if (e.type == sf::Event::MouseButtonPressed)
			{
				HandleMouseDown(e.mouseButton);
			}
			if (e.type == sf::Event::MouseButtonReleased)
			{
				HandleMouseUp(e.mouseButton);
			}
			if (e.type == sf::Event::MouseMoved)
			{
				HandleMouseMove(e.mouseMove);
			}
			if (e.type == sf::Event::MouseLeft)
			{
				HandleMouseLeave();
			}
			if (e.type == sf::Event::MouseEntered)
			{
				HandleMouseEnter();
			}
		}
	}

	sf::RenderWindow m_window;
	sf::Clock m_clock;
};

} // namespace sfml_core

#endif // CG_SFML_CORE_VIEW_H
